import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeAnswer, createAssistantTurn, createRecommendation } from "@/lib/openai";
import { containsSensitiveData, isUnknownAnswer, planDiscovery, progressFor, questions, scoreAssessment } from "@/lib/assessment";
import { getSession, saveTurn } from "@/lib/store";
import { rateLimit } from "@/lib/server";
import type { DiscoveryTopic } from "@/lib/types";

const schema = z.object({ message: z.string().trim().min(1).max(1500) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await rateLimit(`chat:${id}`, 24, 60_000)) return NextResponse.json({ error: "Please wait before sending another message." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Message must be between 1 and 1,500 characters." }, { status: 400 });
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Assessment session not found." }, { status: 404 });
  if (session.stage === "completed" || session.stage === "contact") return NextResponse.json({ error: "This assessment is already ready for completion." }, { status: 409 });

  const sensitive = containsSensitiveData(parsed.data.message);
  const safeMessage = sensitive ? "[Sensitive content omitted by the readiness check]" : parsed.data.message;
  const analysis = sensitive
    ? { acknowledgment: "For privacy, please avoid sharing passwords, customer records, confidential documents, or sensitive personal data. A high-level description is enough.", insight: undefined, suggestedTopic: undefined, question: undefined, facts: { sensitiveData: true } }
    : await analyzeAnswer(session.stage, safeMessage, session.facts);

  session.facts = { ...session.facts, ...analysis.facts };
  if (isUnknownAnswer(parsed.data.message) && session.stage !== "summary") {
    const skipped = new Set([...(session.facts.skippedTopics ?? []), session.stage as DiscoveryTopic]);
    session.facts.skippedTopics = [...skipped];
  }
  session.answerCount++;
  const plan = planDiscovery(session.facts, session.answerCount);

  let score;
  let recommendation;
  let assistantMessage: string;
  let responseMetadata: Record<string, unknown>;
  if (plan.readyForBrief) {
    session.stage = "contact";
    score = scoreAssessment(session.facts);
    recommendation = await createRecommendation(session.facts, score);
    session.score = score;
    session.recommendation = recommendation;
    assistantMessage = `${analysis.acknowledgment}${analysis.insight ? ` ${analysis.insight}` : ""} I have enough context to prepare a focused starting brief.`;
    responseMetadata = { discovery_path: plan.path, selected_topic: "brief", fallback_used: false, missing_critical_facts: plan.missingCriticalFacts };
  } else {
    const nextTopic = plan.nextTopic ?? "risk";
    session.stage = nextTopic;
    const turn = sensitive
      ? { message: `${analysis.acknowledgment} ${questions[nextTopic].message}`, fallbackUsed: true, validationReason: "sensitive_content" }
      : createAssistantTurn(nextTopic, session.facts, safeMessage, analysis.acknowledgment, analysis.insight, analysis.suggestedTopic ?? undefined, analysis.question ?? undefined);
    assistantMessage = turn.message;
    responseMetadata = { discovery_path: plan.path, selected_topic: nextTopic, fallback_used: turn.fallbackUsed, validation_reason: turn.validationReason ?? null };
  }
  const question = questions[session.stage];
  await saveTurn(session, safeMessage, assistantMessage, responseMetadata);
  return NextResponse.json({
    sessionId: id, message: assistantMessage, stage: session.stage, progress: progressFor(session.stage),
    quickReplies: question.quickReplies, score, recommendation,
  });
}
