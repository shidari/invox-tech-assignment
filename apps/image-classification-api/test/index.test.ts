import { describe, expect, it } from "vitest";
import { app } from "../src/app";
import "dotenv/config";

const MOCK_ENV = {
  USERNAME: "user",
  PASSWORD: "pass",
};
describe("/", () => {
  // open api jsonでinternal server errorが出てないか確かめる用
  it("GET /で302リダイレクトとlocationを確認し、/docで200を確認する", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toBe("/doc");
  });
});
describe("/api", () => {
  it("GET /apiでステータスで200が返ってくる", async () => {
    const res = await app.request("/api");
    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toBe("/doc");
  });
});

describe("/doc", () => {
  it("GET /docで401が返ってくる", async () => {
    const res = await app.request("/doc");
    expect(res.status).toBe(401);
  });
  it("GET /docで認証情報をつけて200が返ってくる", async () => {
    const username = "user";
    const password = "pass";
    const res = await app.request(
      "/doc",
      {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      },
      MOCK_ENV,
    );
    expect(res.status).toBe(200);
  });
});

describe("/api", () => {
  it("GET /api/*で認証をつけないと401が返ってくる", async () => {
    const res = await app.request("/api/hoge");
    expect(res.status).toBe(401);
  });
});
