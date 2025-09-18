/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import type { Env } from "hono";
import { app } from "./app";

import { DurableObject } from "cloudflare:workers";

export class RateLimiterDurableObject extends DurableObject {
  ctx: DurableObjectState;
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    this.ctx = ctx;
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS rate_limit (key TEXT PRIMARY KEY, count INTEGER, expiry INTEGER);",
      );
    });
  }

  private async setRateLimitValue(key: string, count: number, expiry: number) {
    this.ctx.storage.sql.exec(
      "INSERT INTO rate_limit (key, count, expiry) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET count = excluded.count, expiry = excluded.expiry;",
      key,
      count,
      expiry,
    );
  }
  async isRateLimited(key: string) {
    const results = this.ctx.storage.sql
      .exec("SELECT count, expiry FROM rate_limit WHERE key = ?;", key)
      .toArray();
    if (!results) return true;
    const result = results[0];
    if (!result) return true;
    const countField = result.count;
    const expiryField = result.expiry;
    const count = Number(countField);
    const expiry = Number(expiryField);
    if (Number.isNaN(count) || Number.isNaN(expiry)) return true;
    const currentTime = Date.now();
    if (currentTime > expiry) return true;
    return count > 99; // 例えば、100回を超えたらレート制限とする
  }

  async getRateLimitValue(key: string) {
    const results = this.ctx.storage.sql
      .exec("SELECT count, expiry FROM rate_limit WHERE key = ?;", [key])
      .toArray();
    if (!results) return null;
    const result = results[0];
    if (!result) return null;
    const count = result.count;
    const expiry = result.expiry;
    return { count, expiry };
  }

  /**
   * Atomically increments the count for the given key and updates expiry if provided.
   * If the key does not exist, creates it with count=1 and expiry.
   * Returns the new count and expiry.
   */
  async incrementRateLimit(key: string) {
    const windowMs = 15 * 60 * 1000; // 15 minutes
    // Get current value
    const now = Date.now();
    const results = this.ctx.storage.sql
      .exec("SELECT count, expiry FROM rate_limit WHERE key = ?;", key)
      .toArray();
    let count = 1;
    let expiry = now + windowMs;
    if (results?.[0]) {
      const current = results[0];
      const currentExpiryField = current.expiry;
      const currentCountField = current.count;
      if (Number.isNaN(currentCountField)) {
        // If count is invalid, reset count and expiry
        count = 1;
        const expiry = now + windowMs;
        await this.setRateLimitValue(key, count, expiry);
        return { count, expiry };
      }
      if (Number.isNaN(currentExpiryField)) {
        // If expiry is invalid, reset count and expiry
        count = 1;
        expiry = now + windowMs;
        await this.setRateLimitValue(key, count, expiry);
        return { count, expiry };
      }
      if (now > expiry) {
        // Window expired, reset count
        count = 1;
        expiry = now + windowMs;
      } else {
        count = Number(currentCountField) + 1;
        expiry = Number(currentExpiryField);
      }
    }
    // Upsert new value
    await this.setRateLimitValue(key, count, expiry);
    return { count, expiry };
  }
}

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
