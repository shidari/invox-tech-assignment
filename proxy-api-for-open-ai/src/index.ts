import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
const API_KEY = process.env.API_KEY || "your_default_api_key";

// 認証ミドルウェア
app.use("*", async (c, next) => {
	const key = c.req.header("x-api-key");
	if (key !== API_KEY) {
		return c.json({ message: "Unauthorized" }, 401);
	}
	await next();
});

app.get("/", (c) => {
	return c.json({ message: "Hello Hono!" });
});

serve(
	{
		fetch: app.fetch,
		port: 8080,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
