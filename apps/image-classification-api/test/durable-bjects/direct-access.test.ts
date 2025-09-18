import { env, runInDurableObject } from "cloudflare:test";
import { expect, it } from "vitest";
import { RateLimiterDurableObject } from "../../src/index";

declare module "cloudflare:test" {
  interface ProvidedEnv {
    RateLimiterDurableObject: DurableObjectNamespace<RateLimiterDurableObject>;
  }
}

it("durable objectの値を更新できるか", async () => {
  const key = "ip-address";
  const id = env.RateLimiterDurableObject.idFromName(key);
  const stub = env.RateLimiterDurableObject.get(id);
  const response = await runInDurableObject(
    stub,
    async (instance: RateLimiterDurableObject) => {
      expect(instance).toBeInstanceOf(RateLimiterDurableObject); // Exact same class as import
      await instance.incrementRateLimit(key);
      return instance.getRateLimitValue(key);
    },
  );
  expect(response?.count).toBe(1);
});

it("レートリミットがかかっているか確認", async () => {
  const key = "ip-address";
  const id = env.RateLimiterDurableObject.idFromName(key);
  const stub = env.RateLimiterDurableObject.get(id);
  const response = await runInDurableObject(
    stub,
    async (instance: RateLimiterDurableObject) => {
      expect(instance).toBeInstanceOf(RateLimiterDurableObject); // Exact same class as import
      for (let i = 0; i < 100; i++) {
        await instance.incrementRateLimit(key);
      }
      return instance.isRateLimited(key);
    },
  );
  expect(response).toBe(true);
});
