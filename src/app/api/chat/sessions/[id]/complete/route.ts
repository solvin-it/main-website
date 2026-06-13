import { NextRequest, NextResponse } from "next/server";
import { completeSession, getSession } from "@/lib/store";
import { triggerN8n } from "@/lib/server";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!session.score || !session.recommendation) return NextResponse.json({ error: "Assessment is not ready." }, { status: 409 });
  if (!session.completedAt) {
    session.stage = "completed";
    await completeSession(session);
    await triggerN8n({ sessionId: session.id, score: session.score, recommendation: session.recommendation, contact: session.lead }).catch(() => undefined);
  }
  return NextResponse.json({ ok: true, score: session.score, recommendation: session.recommendation });
}
