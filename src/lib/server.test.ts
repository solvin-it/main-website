import { afterEach, describe, expect, it } from "vitest";
import { rateLimit } from "./server";

describe("rateLimit", () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("enforces the request ceiling in local fallback mode", async () => {
    const key = `test:${crypto.randomUUID()}`;
    await expect(rateLimit(key, 2, 60_000)).resolves.toBe(true);
    await expect(rateLimit(key, 2, 60_000)).resolves.toBe(true);
    await expect(rateLimit(key, 2, 60_000)).resolves.toBe(false);
  });
});
