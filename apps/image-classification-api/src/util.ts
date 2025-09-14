import { Result } from "neverthrow";
import { createBtoAError } from "./error";

export function calculateCosineSimilarity(a: number[], b: number[]) {
	const dot = a.reduce((sum, v, i) => sum + v * (b?.[i] || 0), 0);
	const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
	const normB = Math.sqrt(b?.reduce((sum, v) => sum + v * v, 0) || 0);
	return dot / (normA * normB);
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
