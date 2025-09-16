import { Result } from "neverthrow";
import { createBtoAError } from "./error";

export function calculateCosineSimilarity(
  a: Float32Array,
  b: Float32Array,
): number {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < a.length; i++) {
    const ai = a[i]!; // dirty non-null assertion
    const bi = b[i]!; // dirty non-null assertion
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function base64url(input: Uint8Array | string) {
  const result =
    typeof input === "string"
      ? Result.fromThrowable(
          () => btoa(input),
          (e) => createBtoAError(e),
        )()
      : Result.fromThrowable(
          () => btoa(String.fromCharCode(...input)),
          (e) => createBtoAError(e),
        )();
  return result.map((str) =>
    str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  );
}
