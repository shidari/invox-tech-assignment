import * as v from "valibot";

export const requestBodySchema = v.object({
  image_path: v.string(), // 例: /image/d03f1d36ca69348c51aa/c413eac329e1c0d03/test.jpg
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
