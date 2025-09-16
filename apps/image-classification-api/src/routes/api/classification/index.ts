import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import {
  errorResponseSchema,
  proxyAPISuccessResponseSchema,
  requestBodySchema,
  successResponseSchema,
} from "./_schema";
import { vValidator } from "@hono/valibot-validator";
import { drizzle } from "drizzle-orm/d1";
import { err, okAsync, ResultAsync, safeTry } from "neverthrow";
import {
  createProxyAPIError,
  createRequestTimestampValidationError,
  createResponseTimestampValidationError,
  errorCodeToMessageMap,
} from "../../../error";
import * as v from "valibot";
import {
  buildGoogleVisionApiClient,
  parseGCPServiceAccountRawString,
  validateGCPServiceAccount,
} from "./_helpers";
import { isoTimestampSchema } from "../../_shared/_helpers/drizzleD1DBClient/schema";
import { calculateCosineSimilarity } from "../../../util";
import { buildDrizzleD1DBClient } from "../../_shared/_helpers/drizzleD1DBClient";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post(
  "/",
  describeRoute({
    description: "Classify an image",
    requestBody: {
      description: "Request body for classify API",
      required: true,
      content: {
        // vvalidatorのschemaをうまく読み取ってくれないため、ここに記述
        "application/json": {
          schema: {
            type: "object",
            properties: {
              image_path: {
                type: "string",
                format: "uri",
                example:
                  "https://fastly.picsum.photos/id/203/200/300.jpg?hmac=mJaqsySlyEjr8fLBHytyVCUyqlfPSxqXePXEIhZZi_Y",
              },
            },
            required: ["image_path"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(successResponseSchema) },
        },
      },
      500: {
        description: "Internal Server Error",
        content: {
          "application/json": { schema: resolver(errorResponseSchema) },
        },
      },
    },
  }),
  vValidator("json", requestBodySchema),
  async (c) => {
    const requestTime = new Date();
    const { image_path } = c.req.valid("json");
    const db = drizzle(c.env.invox_tech_assignment_db);
    const client = buildDrizzleD1DBClient(db);
    const result = safeTry(async function* () {
      const parsed = yield* parseGCPServiceAccountRawString(
        c.env.GCP_SERVICE_ACCOUNT,
      );
      const validated = yield* validateGCPServiceAccount(parsed);
      const googleVisionApiClient = yield* await buildGoogleVisionApiClient(
        validated,
      );
      const { label, confidence } =
        yield* await googleVisionApiClient.runAnnotateImageApi(image_path);
      // ここ、隠蔽したいが、c.envの部分でちょっといまいち、というか、切り分け方に悩んでいる。
      const embeddingRes = yield* ResultAsync.fromPromise(
        fetch(`${c.env.PROXY_API_URL}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": c.env.PROXY_API_KEY,
          },
          body: JSON.stringify({ text: label }),
        }),
        (e) => createProxyAPIError(e),
      );

      if (!embeddingRes.ok) {
        return err(
          createProxyAPIError(
            `Failed to get embedding from OpenAI: ${embeddingRes.status} ${embeddingRes.statusText}`,
          ),
        );
      }
      const embeddingData = yield* ResultAsync.fromPromise(
        embeddingRes.json(),
        (e) => createProxyAPIError(e),
      );
      const validatedEmbeddingResult = v.safeParse(
        proxyAPISuccessResponseSchema,
        embeddingData,
      );
      if (!validatedEmbeddingResult.success) {
        return err(
          createProxyAPIError(
            `Proxy API response schema validation failed: ${JSON.stringify(validatedEmbeddingResult.issues)}`,
          ),
        );
      }
      const { embeddings } = validatedEmbeddingResult.output;
      const queryEmbeddings = new Float32Array(embeddings);
      const labelAndEmbeddings =
        yield* await client.queries.selectAllLabelsAndEmbeddingsList();

      const SIMILARITY_THRESHOLD = 0.8;
      const similarEmbeddings = labelAndEmbeddings.filter(
        (item) =>
          calculateCosineSimilarity(item.embeddings, queryEmbeddings) >=
          SIMILARITY_THRESHOLD,
      );

      const isNewClassRequired = similarEmbeddings.length === 0;

      if (isNewClassRequired) {
        console.log("No similar data found, adding new class and label");
        yield* await client.commands.insertLabelAndEmbeddings(
          label,
          embeddings,
        );
      }
      const { classId } =
        yield* await client.queries.selectClassAndLabelAndEmbeddings({ label });

      const responseTime = new Date();
      // この辺りは、後で綺麗にする
      const requestTimeStampResult = v.safeParse(
        isoTimestampSchema,
        requestTime.toISOString(),
      );
      if (!requestTimeStampResult.success) {
        return err(
          createRequestTimestampValidationError(
            `Invalid request timestamp: ${requestTime.toISOString()}`,
          ),
        );
      }
      const requestTimeStamp = requestTimeStampResult.output;
      const responseTimeStampResult = v.safeParse(
        isoTimestampSchema,
        responseTime.toISOString(),
      );
      if (!responseTimeStampResult.success) {
        return err(
          createResponseTimestampValidationError(
            `Invalid response timestamp: ${responseTime.toISOString()}`,
          ),
        );
      }
      const responseTimeStamp = responseTimeStampResult.output;
      yield* await client.commands.insertAIAnalysisLog({
        image_path,
        success: true,
        message: "Request to Google Vision API succeeded",
        class: classId,
        confidence,
        request_timestamp: requestTimeStamp,
        response_timestamp: responseTimeStamp,
      });
      return okAsync({
        success: true,
        message: "success",
        estimated_data: {
          class: classId,
          confidence: label,
        },
      });
    });
    return await result.match(
      async (value) => {
        return c.json(value, 200);
      },
      async (error) => {
        const errorMessage =
          errorCodeToMessageMap[error.code] || "An unexpected error occurred";
        console.error(error.error);
        const result = await client.commands.insertAIAnalysisLog({
          image_path,
          success: false,
          message: errorMessage,
        });
        if (!result.isErr()) {
          return c.json({
            success: false,
            message: `Error:${error.code}`,
            estimated_data: {},
          });
        }
        switch (error._tag) {
          case "AtobError":
          case "BtoAError":
          case "ClassAndLabelAndEmbeddingsTableError":
          case "GoogleTokenApiRequestError":
          case "GoogleTokenApiResponseValidationError":
          case "ImportKeyError":
          case "SignGooglePrivateKeyError":
          case "VisonAPIResponseValidationError":
          case "GoogleVisionApiError":
          case "ProxyAPIError":
          case "requestTimestampValidationError":
          case "responseTimestampValidationError":
            return c.json({
              success: false,
              message: `Error:${error.code}`,
              estimated_data: {},
            });
          default:
            return c.json({
              success: false,
              message: `Error:${error.code}`,
              estimated_data: {},
            });
        }
      },
    );
  },
);

export default app;
