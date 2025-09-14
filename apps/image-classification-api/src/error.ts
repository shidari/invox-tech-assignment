type ErrorPair = { _tag: string; code: `E${number}` };

export const errorPairs = [
	{ _tag: "ParseJsonError", code: "E1" },
	{ _tag: "GcpServiceAccountSchemaError", code: "E2" },
	{ _tag: "GoogleAccessTokenError", code: "E3" },
	{ _tag: "GoogleVisionApiError", code: "E4" },
	{ _tag: "VisonAPIResponseValidationError", code: "E5" },
	{ _tag: "ProxyAPIError", code: "E6" },
	{ _tag: "ClassAndLabelAndEmbeddingsTableError", code: "E7" },
	{ _tag: "BtoAError", code: "E8" },
	{ _tag: "ImportKeyError", code: "E9" },
	{ _tag: "SignGooglePrivateKeyError", code: "E10" },
	{ _tag: "GoogleTokenApiRequestError", code: "E11" },
	{ _tag: "AtobError", code: "E12" },
	{ _tag: "GoogleTokenApiResponseValidationError", code: "E13" },
	{ _tag: "requestTimestampValidationError", code: "E14" },
	{ _tag: "responseTimestampValidationError", code: "E15" },
] as const satisfies readonly ErrorPair[];

type ErrorTag = (typeof errorPairs)[number]["_tag"];
type ErrorCode = (typeof errorPairs)[number]["code"];

type AppError<T extends ErrorTag, C extends ErrorCode> = {
	_tag: T;
	code: C;
	error: Error;
};

export const errorCodeToMessageMap: Record<ErrorCode, string> = {
	E1: "Failed to parse JSON",
	E2: "GCP Service Account schema is invalid",
	E3: "Failed to get Google Access Token",
	E4: "Google Vision API request failed",
	E5: "Google Vision API response validation failed",
	E6: "Proxy API request failed",
	E7: "ClassAndLabelAndEmbeddings table operation failed",
	E8: "Failed to convert Blob to ArrayBuffer",
	E9: "Failed to import cryptographic key",
	E10: "Failed to sign with Google private key",
	E11: "Google Token API request failed",
	E12: "Failed to decode base64 string",
	E13: "Google Token API response validation failed",
	E14: "Request timestamp validation failed",
	E15: "Response timestamp validation failed",
};

export const createParseJsonError = (
	val: unknown,
): AppError<"ParseJsonError", "E1"> => ({
	_tag: "ParseJsonError",
	code: "E1",
	error: new Error(`Failed to parse JSON: ${val}`),
});

export const createGcpServiceAccountSchemaError = (
	val: unknown,
): AppError<"GcpServiceAccountSchemaError", "E2"> => ({
	_tag: "GcpServiceAccountSchemaError",
	code: "E2",
	error: new Error(`GCP Service Account schema is invalid: ${val}`),
});

export const createGoogleAccessTokenError = (
	val: unknown,
): AppError<"GoogleAccessTokenError", "E3"> => ({
	_tag: "GoogleAccessTokenError",
	code: "E3",
	error: new Error(`Failed to get Google Access Token: ${val}`),
});

export const createGoogleVisionApiError = (
	val: unknown,
): AppError<"GoogleVisionApiError", "E4"> => ({
	_tag: "GoogleVisionApiError",
	code: "E4",
	error: new Error(`Google Vision API request failed: ${val}`),
});

export const createVisonAPIResponseValidationError = (
	val: unknown,
): AppError<"VisonAPIResponseValidationError", "E5"> => ({
	_tag: "VisonAPIResponseValidationError",
	code: "E5",
	error: new Error(`Google Vision API response validation failed: ${val}`),
});

export const createProxyAPIError = (
	val: unknown,
): AppError<"ProxyAPIError", "E6"> => ({
	_tag: "ProxyAPIError",
	code: "E6",
	error: new Error(`Proxy API request failed: ${val}`),
});

export const createClassAndLabelAndEmbeddingsTableError = (
	val: unknown,
): AppError<"ClassAndLabelAndEmbeddingsTableError", "E7"> => ({
	_tag: "ClassAndLabelAndEmbeddingsTableError",
	code: "E7",
	error: new Error(`ClassAndLabelAndEmbeddings table operation failed: ${val}`),
});

export const createBtoAError = (val: unknown): AppError<"BtoAError", "E8"> => ({
	_tag: "BtoAError",
	code: "E8",
	error: new Error(`Failed to convert Blob to ArrayBuffer: ${val}`),
});

export const createImportKeyError = (
	val: unknown,
): AppError<"ImportKeyError", "E9"> => ({
	_tag: "ImportKeyError",
	code: "E9",
	error: new Error(`Failed to import cryptographic key: ${val}`),
});

export const createSignGooglePrivateKeyError = (
	val: unknown,
): AppError<"SignGooglePrivateKeyError", "E10"> => ({
	_tag: "SignGooglePrivateKeyError",
	code: "E10",
	error: new Error(`Failed to sign with Google private key: ${val}`),
});

export const createGoogleTokenApiRequestError = (
	val: unknown,
): AppError<"GoogleTokenApiRequestError", "E11"> => ({
	_tag: "GoogleTokenApiRequestError",
	code: "E11",
	error: new Error(`Google Token API request failed: ${val}`),
});

export const createAtobError = (
	val: unknown,
): AppError<"AtobError", "E12"> => ({
	_tag: "AtobError",
	code: "E12",
	error: new Error(`Failed to decode base64 string: ${val}`),
});

export const createGoogleTokenApiResponseValidationError = (
	val: unknown,
): AppError<"GoogleTokenApiResponseValidationError", "E13"> => ({
	_tag: "GoogleTokenApiResponseValidationError",
	code: "E13",
	error: new Error(`Google Token API response validation failed: ${val}`),
});

export const createRequestTimestampValidationError = (
	val: unknown,
): AppError<"requestTimestampValidationError", "E14"> => ({
	_tag: "requestTimestampValidationError",
	code: "E14",
	error: new Error(`Request timestamp validation failed: ${val}`),
});
export const createResponseTimestampValidationError = (
	val: unknown,
): AppError<"responseTimestampValidationError", "E15"> => ({
	_tag: "responseTimestampValidationError",
	code: "E15",
	error: new Error(`Response timestamp validation failed: ${val}`),
});
