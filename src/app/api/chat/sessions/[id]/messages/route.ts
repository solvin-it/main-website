import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeAnswer, createRecommendation } from "@/lib/claude";
import { containsSensitiveData, nextStage, progressFor, questions, scoreAssessment } from "@/lib/assessment";
import { getSession, saveTurn } from "@/lib/store";
import { rateLimit } from "@/lib/server";

const schema = z.object({ message: z.string().trim().min(1).max(1500) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!rateLimit(`chat:${id}`, 24, 60_000)) return NextResponse.json({ error: "Please wait before sending another message." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Message must be between 1 and 1,500 characters." }, { status: 400 });
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Assessment session not found." }, { status: 404 });
  if (session.stage === "completed" || session.stage === "contact") return NextResponse.json({ error: "This assessment is already ready for completion." }, { status: 409 });

  const sensitive = containsSensitiveData(parsed.data.message);
  const safeMessage = sensitive ? "[Sensitive content omitted by the readiness check]" : parsed.data.message;
  const analysis = sensitive
    ? { acknowledgment: "For privacy, please avoid sharing passwords, customer records, confidential documents, or sensitive personal data. A high-level description is enough.", facts: { sensitiveData: true } }
    : await analyzeAnswer(session.stage, safeMessage, session.facts);

  session.facts = { ...session.facts, ...analysis.facts };
  session.answerCount++;
  const following = nextStage(session.stage);
  session.stage = following === "summary" ? "contact" : following;

  let score;
  let recommendation;
  if (session.stage === "contact" || session.answerCount >= 15) {
    session.stage = "contact";
    score = scoreAssessment(session.facts);
    recommendation = await createRecommendation(session.facts, score);
    session.score = score;
    session.recommendation = recommendation;
  }
  const question = questions[session.stage];
  const assistantMessage = `${analysis.acknowledgment} ${question.message}`;
  await saveTurn(session, safeMessage, assistantMessage);
  return NextResponse.json({
    sessionId: id, message: assistantMessage, stage: session.stage, progress: progressFor(session.stage),
    quickReplies: question.quickReplies, score, recommendation,
  });
}
