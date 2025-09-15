import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import {
  classesSuccessResponseSchema,
  classIdParamSchema,
  classIdSuccessResponseSchema,
} from "./_schema";
import { drizzle } from "drizzle-orm/d1";
import { buildDrizzleD1DBClient } from "../_shared/_helpers/drizzleD1DBClient";
import { okAsync, safeTry } from "neverthrow";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get(
  "/",
  describeRoute({
    description: "Get all classes and labels",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(classesSuccessResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const db = drizzle(c.env.invox_tech_assignment_db);
    const client = buildDrizzleD1DBClient(db);
    const result = await safeTry(async function* () {
      const res =
        yield* await client.queries.selectAllClassesAndLabelsAndEmbeddingsList();
      return okAsync(res.map((r) => ({ classId: r.classId, label: r.label })));
    });
    return result.match(
      (data) => {
        return c.json(data, 200);
      },
      (error) => {
        console.error(error.error);
        return c.json({ message: "internal server error" }, 500);
      },
    );
  },
);

app.get(
  "/:classId",
  describeRoute({
    description: "Get label by classId",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(classIdSuccessResponseSchema),
          },
        },
      },
    },
  }),
  vValidator("param", classIdParamSchema),
  async (c) => {
    const { classId } = c.req.valid("param");
    const db = drizzle(c.env.invox_tech_assignment_db);
    const client = buildDrizzleD1DBClient(db);
    const result = await safeTry(async function* () {
      const res = yield* await client.queries.selectClassAndLabelAndEmbeddings({
        classId,
      });
      return okAsync({ classId: res.classId, label: res.label });
    });
    return result.match(
      (data) => {
        return c.json(data, 200);
      },
      (error) => {
        console.error(error.error);
        return c.json({ message: "internal server error" }, 500);
      },
    );
  },
);

export default app;
