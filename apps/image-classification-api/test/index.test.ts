import { describe, expect, it } from "vitest";
import { app } from "../src/app";
describe("/", () => {
	// open api jsonでinternal server errorが出てないか確かめる用
	it("GET /でステータスで200が返ってくる", async () => {
		const res = await app.request("/");
		expect(res.status).toBe(200);
	});
});
describe("/api", () => {
	it("GET /apiでステータスで200が返ってくる", async () => {
		const res = await app.request("/api");
		expect(res.status).toBe(200);
	});
});
