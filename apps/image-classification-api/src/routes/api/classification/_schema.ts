import * as v from "valibot";

export const requestBodySchema = v.object({
  image_path: v.pipe(v.string(), v.url("The url is badly formatted.")),
});

export const successResponseSchema = v.object({
  success: v.literal(true),
  message: v.string(),
  estimated_data: v.object({
    class: v.number(),
    confidence: v.number(),
  }),
});

// エラー時レスポンススキーマ
export const errorResponseSchema = v.object({
  success: v.literal(false),
  message: v.string(),
  estimated_data: v.object({}),
});

export const proxyAPISuccessResponseSchema = v.object({
  embeddings: v.array(v.number()),
});
