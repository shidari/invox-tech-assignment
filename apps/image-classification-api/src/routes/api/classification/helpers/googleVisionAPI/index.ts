import { err, ok, okAsync, Result, ResultAsync, safeTry } from "neverthrow";
import { safeParse, type InferOutput } from "valibot";
import {
	gcpServiceAccountSchema,
	googleTokenAPISucessResponseSchema,
	googleVisionAPISuccessResponseSchema,
} from "./schema";
import {
	createAtobError,
	createGoogleTokenApiRequestError,
	createGoogleTokenApiResponseValidationError,
	createGoogleVisionApiError,
	createImportKeyError,
	createParseJsonError,
	createSignGooglePrivateKeyError,
	createVisonAPIResponseValidationError,
} from "../../../../../error";
import * as v from "valibot";
import { base64url } from "../../../../../util";

export const parseGCPServiceAccountRawString = (rawJSONString: string) => {
	return Result.fromThrowable(
		async () => JSON.parse(rawJSONString),
		(e) => createParseJsonError(e),
	)();
};

export const validateGCPServiceAccount = (val: unknown) => {
	const result = safeParse(gcpServiceAccountSchema, val);
	if (!result.success) {
		return err(createParseJsonError(val));
	}
	return ok(result.output);
};

export async function signGoogleJwt(
	header: object,
	payload: object,
	privateKeyPem: string,
) {
	return safeTry(async function* () {
		const encoder = new TextEncoder();
		const headerB64 = yield* base64url(encoder.encode(JSON.stringify(header)));
		const payloadB64 = yield* base64url(
			encoder.encode(JSON.stringify(payload)),
		);
		const data = `${headerB64}.${payloadB64}`;
		const pem = privateKeyPem
			.replace(/-----[^-]+-----/g, "")
			.replace(/\s+/g, "");
		const binaryDer = yield* Result.fromThrowable(
			() => Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)),
			(e) => createAtobError(e),
		)();
		const key = yield* ResultAsync.fromPromise(
			crypto.subtle.importKey(
				"pkcs8",
				binaryDer,
				{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
				false,
				["sign"],
			),
			(e) => createImportKeyError(e),
		);
		const signature = new Uint8Array(
			yield* ResultAsync.fromPromise(
				crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(data)),
				(e) => createSignGooglePrivateKeyError(e),
			),
		);
		const signatureB64 = yield* base64url(signature);
		return okAsync(`${data}.${signatureB64}`);
	});
}

const createGoogleAccessToken = async (
	serviceAccount: InferOutput<typeof gcpServiceAccountSchema>,
	scope: string,
) => {
	return safeTry(async function* () {
		const now = Math.floor(Date.now() / 1000);
		const header = { alg: "RS256", typ: "JWT" };
		const payload = {
			iss: serviceAccount.client_email,
			scope,
			aud: serviceAccount.token_uri,
			exp: now + 3600,
			iat: now,
		};
		const jwt = yield* await signGoogleJwt(
			header,
			payload,
			serviceAccount.private_key,
		);
		const res = yield* ResultAsync.fromPromise(
			fetch(serviceAccount.token_uri, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
					assertion: jwt,
				}).toString(),
			}),
			(e) => createGoogleTokenApiRequestError(e),
		);
		if (!res.ok) {
			const text = yield* ResultAsync.fromPromise(res.text(), (e) =>
				createGoogleTokenApiRequestError(e),
			);
			return err(
				createGoogleTokenApiRequestError(
					`Status: ${res.status}, Body: ${text}`,
				),
			);
		}
		const data = yield* ResultAsync.fromPromise(res.json(), (e) =>
			createParseJsonError(e),
		);

		const validationResult = safeParse(
			googleTokenAPISucessResponseSchema,
			data,
		);
		if (!validationResult.success) {
			return err(createGoogleTokenApiResponseValidationError(data));
		}
		return ok(validationResult.output.access_token);
	});
};

export const buildGoogleVisionApiClient = (
	serviceAccountObject: InferOutput<typeof gcpServiceAccountSchema>,
) => {
	return safeTry(async function* () {
		const scope = "https://www.googleapis.com/auth/cloud-platform";
		const accessToken = yield* await createGoogleAccessToken(
			serviceAccountObject,
			scope,
		);
		return okAsync({
			async runAnnotateImageApi(imageUrl: string) {
				return safeTry(async function* () {
					const body = {
						requests: [
							{
								image: {
									source: {
										imageUri: imageUrl,
									},
								},
								features: [{ type: "LABEL_DETECTION" }],
							},
						],
					};
					const projectId = serviceAccountObject.project_id;
					const res = yield* ResultAsync.fromPromise(
						fetch("https://vision.googleapis.com/v1/images:annotate", {
							method: "POST",
							headers: {
								Authorization: `Bearer ${accessToken}`,
								"x-goog-user-project": projectId,
								"Content-Type": "application/json; charset=utf-8",
							},
							body: JSON.stringify(body),
						}),
						(e) => createGoogleVisionApiError(e),
					);
					if (!res.ok) {
						return err(
							createGoogleVisionApiError(
								`Google Vision API request failed: ${res.status} ${res.statusText}`,
							),
						);
					}
					const result = yield* ResultAsync.fromPromise(res.json(), (e) =>
						createGoogleVisionApiError(e),
					);
					const validatedResult = v.safeParse(
						googleVisionAPISuccessResponseSchema,
						result,
					);
					if (!validatedResult.success) {
						return err(
							createGoogleVisionApiError(
								`Google Vision API response schema validation failed: ${JSON.stringify(validatedResult.issues)}`,
							),
						);
					}
					const { responses } = validatedResult.output;
					const topResult = responses.at(0)?.labelAnnotations?.[0];
					if (!topResult) {
						return err(
							createVisonAPIResponseValidationError(
								`Google Vision API response is missing label annotations`,
							),
						);
					}
					return okAsync({
						label: topResult.description,
						confidence: topResult.score,
					});
				});
			},
		});
	});
};
