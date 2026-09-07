import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

const buckets = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= max) return false;
  current.count++;
  return true;
}

export async function rateLimit(key: string, max = 30, windowMs = 60_000) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return memoryRateLimit(key, max, windowMs);

  const db = createClient(url, serviceKey, { auth: { persistSession: false }, db: { schema: "solvin" } });
  const hashedKey = createHash("sha256").update(key).digest("hex");
  const { data, error } = await db.rpc("consume_rate_limit", {
    p_bucket_key: hashedKey,
    p_request_limit: max,
    p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
  });
  if (error) return memoryRateLimit(key, max, windowMs);
  return data === true;
}
