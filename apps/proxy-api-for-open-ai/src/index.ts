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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
app.post("/embeddings", async (c) => {
  try {
    const { text } = await c.req.json();
    if (!text || typeof text !== "string") {
      return c.json({ error: "Missing or invalid text" }, 400);
    }
    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    const data = await embeddingRes.json();
    if (!embeddingRes.ok) {
      return c.json(
        { error: data.error?.message || "Failed to get embedding from OpenAI" },
        500,
      );
    }
    const embeddings = data.data?.[0]?.embedding;
    if (!embeddings) {
      return c.json({ error: "No embeddings returned from OpenAI" }, 500);
    }
    return c.json({ embeddings });
  } catch (e) {
    console.error(e);
    return c.json({ message: "Internal server error." }, 500);
  }
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
