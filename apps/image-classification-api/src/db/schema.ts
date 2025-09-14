import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const classAndLabelAndEmbeddings = sqliteTable(
	"class_label_embeddings",
	{
		id: integer().primaryKey({ autoIncrement: true }),
		embeddings: text("embeddings").notNull(),
		label: text("label").notNull(),
	},
);

export const aiAnalysisLog = sqliteTable("ai_analysis_log", {
	id: integer().primaryKey({ autoIncrement: true }),
	image_path: text("image_path", { length: 255 }),
	success: integer("success", { mode: "boolean" }).notNull(),
	message: text("message", { length: 255 }),
	class: integer("class"),
	confidence: real("confidence"),
	request_timestamp: text("request_timestamp"),
	response_timestamp: text("response_timestamp"),
});
