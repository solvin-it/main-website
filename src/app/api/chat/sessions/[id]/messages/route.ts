import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeAnswer, createAssistantTurn, createRecommendation } from "@/lib/openai";
import { containsSensitiveData, isUnknownAnswer, planDiscovery, progressFor, questions, scoreAssessment } from "@/lib/assessment";
import { getSession, saveTurn } from "@/lib/store";
import { rateLimit } from "@/lib/server";
import type { DiscoveryTopic } from "@/lib/types";
import { answerServiceQuestion } from "@/lib/assistant-service-questions";
import { createProjectPreview } from "@/lib/project-preview";

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
  const serviceAnswer = !sensitive && answerServiceQuestion(safeMessage);
  if (sensitive || serviceAnswer) {
    if (sensitive) session.facts = { ...session.facts, sensitiveData: true };
    const message = `${sensitive ? "Please leave out passwords and private records. A high-level description is enough." : serviceAnswer} ${questions[session.stage].message}`;
    await saveTurn(session, safeMessage, message, { selected_topic: session.stage, response_type: sensitive ? "sensitive_content" : "service_question" });
    return NextResponse.json({
      sessionId: id, message, stage: session.stage, progress: progressFor(session.stage), quickReplies: questions[session.stage].quickReplies,
      projectPreview: createProjectPreview(session.facts, session.answerCount, session.stage),
    });
  }
  const unknown = isUnknownAnswer(safeMessage);
  const analysis = unknown
    ? { acknowledgment: "We can leave that open for now.", insight: undefined, suggestedTopic: undefined, question: undefined, facts: {} }
    : await analyzeAnswer(session.stage, safeMessage, session.facts);

  session.facts = { ...session.facts, ...analysis.facts };
  if (unknown && session.stage !== "summary") {
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
    assistantMessage = "Here’s a starting brief based on what you’ve shared. Any open decisions are noted for review.";
    responseMetadata = { discovery_path: plan.path, selected_topic: "brief", fallback_used: false, missing_critical_facts: plan.missingCriticalFacts };
  } else {
    const nextTopic = plan.nextTopic ?? "risk";
    session.stage = nextTopic;
    const turn = createAssistantTurn(nextTopic, session.facts, safeMessage, analysis.acknowledgment, analysis.insight, analysis.suggestedTopic ?? undefined, analysis.question ?? undefined);
    assistantMessage = turn.message;
    responseMetadata = { discovery_path: plan.path, selected_topic: nextTopic, fallback_used: turn.fallbackUsed, validation_reason: turn.validationReason ?? null };
  }
  const question = questions[session.stage];
  await saveTurn(session, safeMessage, assistantMessage, responseMetadata);
  return NextResponse.json({
    sessionId: id, message: assistantMessage, stage: session.stage, progress: progressFor(session.stage),
    quickReplies: question.quickReplies, score, recommendation,
    projectPreview: createProjectPreview(session.facts, session.answerCount, session.stage),
  });
}
