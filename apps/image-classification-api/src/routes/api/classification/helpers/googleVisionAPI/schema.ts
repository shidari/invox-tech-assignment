import * as v from "valibot";

export const gcpServiceAccountSchema = v.object({
	type: v.literal("service_account"),
	project_id: v.string(),
	private_key_id: v.string(),
	private_key: v.string(),
	client_email: v.string(),
	client_id: v.string(),
	auth_uri: v.string(),
	token_uri: v.string(),
	auth_provider_x509_cert_url: v.string(),
	client_x509_cert_url: v.string(),
	universe_domain: v.optional(v.string()),
});

// いったんこれしか使わないので
export const googleTokenAPISucessResponseSchema = v.object({
	access_token: v.string(),
});

export const googleVisionAPISuccessResponseSchema = v.object({
	responses: v.array(
		v.object({
			labelAnnotations: v.array(
				v.object({
					description: v.string(),
					score: v.number(),
				}),
			),
		}),
	),
});
