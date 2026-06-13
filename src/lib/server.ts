import { createHmac } from "crypto";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 30, windowMs = 60_000) {
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

export async function triggerN8n(payload: Record<string, unknown>) {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return;
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-solvin-signature": signature, "x-idempotency-key": String(payload.sessionId) }, body, signal: AbortSignal.timeout(8_000) });
}
