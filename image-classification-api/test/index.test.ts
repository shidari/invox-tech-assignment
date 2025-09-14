import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("/api", () => {
	it("GET /apiでステータスで200が返ってくる", async () => {
		const res = await app.request("/api");
		expect(res.status).toBe(200);
	});
});
