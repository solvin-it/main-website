import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/store";
import { progressFor, questions } from "@/lib/assessment";
import { rateLimit } from "@/lib/server";

const schema = z.object({
  entryPage: z.string().max(300).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`create:${ip}`, 8, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    const session = await createSession(parsed.data);
    return NextResponse.json({ sessionId: session.id, stage: session.stage, progress: progressFor(session.stage), ...questions.opening });
  } catch {
    return NextResponse.json({ error: "Unable to start the assessment." }, { status: 500 });
  }
}
