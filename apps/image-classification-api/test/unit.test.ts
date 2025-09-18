import { describe, expect, it } from "vitest";
import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";

import worker from "../src";

const MOCKED_ENV = {
  ...env,
  USERNAME: "user",
  PASSWORD: "pass",
  API_TOKEN: "token",
};
describe("/", () => {
  // open api jsonでinternal server errorが出てないか確かめる用
  it("GET /で302リダイレクトとlocationを確認し、/docで200を確認する", async () => {
    const request = new Request("http://localhost:8787/");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, MOCKED_ENV, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toBe("/doc");
  });
});
describe("/api", () => {
  it("GET /apiで302リダイレクトとlocationを確認し、/docで200を確認する", async () => {
    const request = new Request("http://localhost:8787/api");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, MOCKED_ENV, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toBe("/doc");
  });
});

describe("/doc", () => {
  it("GET /docで401が返ってくる", async () => {
    const request = new Request("http://localhost:8787/doc");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, MOCKED_ENV, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(401);
  });
  it("GET /docで認証情報をつけて200が返ってくる", async () => {
    const username = "user";
    const password = "pass";
    const request = new Request("http://localhost:8787/doc", {
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
    });
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, MOCKED_ENV, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
  });
});

describe("/api", () => {
  it("GET /api/*で認証をつけないと401が返ってくる", async () => {
    const request = new Request("http://localhost:8787/api/hoge");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, MOCKED_ENV, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(401);
  });
});

describe("/api/classification", () => {
  it("GET /api/*100回未満/api/classificationのリクエストがあった場合、200を返す", async () => {
    const request = new Request("http://localhost:8787/api/classification", {
      headers: {
        Authorization: `Bearer ${MOCKED_ENV.API_TOKEN}`,
      },
    });
    const ctx = createExecutionContext();
    for (let i = 0; i <= 100; i++) {
      await worker.fetch(request, MOCKED_ENV, ctx);
      await waitOnExecutionContext(ctx);
    }
    const response = await worker.fetch(request, MOCKED_ENV, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(429);
  });
});
