import { NextResponse } from "next/server";
import { progressFor, questions } from "@/lib/assessment";
import { getSession } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  return NextResponse.json({
    sessionId: session.id,
    stage: session.stage,
    progress: progressFor(session.stage),
    ...questions[session.stage],
    score: session.score,
    recommendation: session.recommendation,
  });
}
