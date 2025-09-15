import type { DrizzleD1Database } from "drizzle-orm/d1";
import { errAsync, okAsync, ResultAsync, safeTry } from "neverthrow";
import {
  aiAnalysisLog,
  classAndLabelAndEmbeddings,
} from "../../../../db/schema";
import { createClassAndLabelAndEmbeddingsTableError } from "../../../../error";
import { eq, and } from "drizzle-orm";
import type { InferOutput } from "valibot";
import type { isoTimestampSchema } from "./schema";

export const buildDrizzleD1DBClient = (
  db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  },
) => {
  const queryObject = {
    async selectAllLabelsAndEmbeddingsList() {
      return safeTry(async function* () {
        const storedData = yield* await ResultAsync.fromPromise(
          db.select().from(classAndLabelAndEmbeddings),
          (e) => createClassAndLabelAndEmbeddingsTableError(e),
        );
        const transformedData = storedData.map(
          ({ label, embeddings: rawEmbeddings }) => ({
            embeddings: rawEmbeddings
              .split(",")
              .map((rawEmbed) => Number(rawEmbed)),
            label,
          }),
        );
        return okAsync(transformedData);
      });
    },
    async selectAllClassesAndLabelsAndEmbeddingsList(
      filter: { label?: string } = {},
    ) {
      return safeTry(async function* () {
        const storedData = yield* await ResultAsync.fromPromise(
          db
            .select()
            .from(classAndLabelAndEmbeddings)
            .where(
              filter.label
                ? eq(classAndLabelAndEmbeddings.label, filter.label)
                : undefined,
            ),
          (e) => createClassAndLabelAndEmbeddingsTableError(e),
        );
        const transformedData = storedData.map(
          ({ id, label, embeddings: rawEmbeddings }) => ({
            classId: id,
            embeddings: rawEmbeddings
              .split(",")
              .map((rawEmbed) => Number(rawEmbed)),
            label,
          }),
        );
        return okAsync(transformedData);
      });
    },
    async selectClassAndLabelAndEmbeddings(filter: {
      label?: string;
      classId?: number;
    }) {
      return safeTry(async function* () {
        const storedData = yield* await ResultAsync.fromPromise(
          db
            .select()
            .from(classAndLabelAndEmbeddings)
            .where(
              and(
                filter.label
                  ? eq(classAndLabelAndEmbeddings.label, filter.label)
                  : undefined,
                filter.classId
                  ? eq(classAndLabelAndEmbeddings.id, filter.classId)
                  : undefined,
              ),
            )
            .limit(1),
          (e) => createClassAndLabelAndEmbeddingsTableError(e),
        );
        if (storedData.length === 0) {
          return errAsync(
            createClassAndLabelAndEmbeddingsTableError(
              `No data found for label: ${filter.label}`,
            ),
          );
        }
        if (storedData.length > 1) {
          return errAsync(
            createClassAndLabelAndEmbeddingsTableError(
              `Multiple data found for label: ${filter.label}`,
            ),
          );
        }
        const topData = storedData[0];
        if (!topData) {
          return errAsync(
            createClassAndLabelAndEmbeddingsTableError(
              `No data found for label: ${filter.label}`,
            ),
          );
        }
        const { id, label, embeddings: rawEmbeddings } = topData;
        const transformedData = {
          classId: id,
          embeddings: rawEmbeddings
            .split(",")
            .map((rawEmbed) => Number(rawEmbed)),
          label,
        };
        return okAsync(transformedData);
      });
    },
  };
  const commandObject = {
    async insertLabelAndEmbeddings(label: string, embeddings: number[]) {
      return ResultAsync.fromPromise(
        db
          .insert(classAndLabelAndEmbeddings)
          .values({
            label,
            embeddings: embeddings.join(","),
          })
          .run(),
        (e) => createClassAndLabelAndEmbeddingsTableError(e),
      );
    },
    async insertAIAnalysisLog(data: {
      image_path?: string;
      success: boolean;
      message?: string;
      class?: number;
      confidence?: number;
      request_timestamp?: InferOutput<typeof isoTimestampSchema>;
      response_timestamp?: InferOutput<typeof isoTimestampSchema>;
    }) {
      return ResultAsync.fromPromise(
        db.insert(aiAnalysisLog).values(data).run(),
        (e) => createClassAndLabelAndEmbeddingsTableError(e),
      );
    },
  };
  return {
    queries: queryObject,
    commands: commandObject,
  };
};
