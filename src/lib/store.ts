import { createClient } from "@supabase/supabase-js";
import type { AssessmentFacts, AssessmentStage, LeadContact, ReadinessScore, Recommendation } from "./types";

export interface SessionRecord {
  id: string;
  stage: AssessmentStage;
  facts: AssessmentFacts;
  answerCount: number;
  entryPage?: string;
  utm?: Record<string, string>;
  score?: ReadinessScore;
  recommendation?: Recommendation;
  lead?: LeadContact;
  completedAt?: string;
}

const memory = new Map<string, SessionRecord>();

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function createSession(input: Pick<SessionRecord, "entryPage" | "utm">) {
  const record: SessionRecord = { id: crypto.randomUUID(), stage: "opening", facts: {}, answerCount: 0, ...input };
  const db = supabase();
  if (db) {
    const { error } = await db.from("chat_sessions").insert({
      id: record.id, session_status: "active", current_stage: record.stage,
      entry_page: record.entryPage, utm_source: record.utm?.source, utm_medium: record.utm?.medium, utm_campaign: record.utm?.campaign,
    });
    if (error) throw error;
  } else memory.set(record.id, record);
  return record;
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const db = supabase();
  if (!db) return memory.get(id) ?? null;
  const { data } = await db.from("chat_sessions").select("*, assessment_facts(fact_key,fact_value), readiness_scores(*), recommendations(*)").eq("id", id).single();
  if (!data) return null;
  const facts = Object.fromEntries((data.assessment_facts ?? []).map((fact: { fact_key: string; fact_value: unknown }) => [fact.fact_key, fact.fact_value]));
  return { id: data.id, stage: data.current_stage, answerCount: data.answer_count ?? 0, facts, completedAt: data.completed_at };
}

export async function saveTurn(record: SessionRecord, userMessage: string, assistantMessage: string) {
  const db = supabase();
  if (!db) { memory.set(record.id, record); return; }
  await db.from("chat_messages").insert([
    { session_id: record.id, sender: "user", message_text: userMessage, message_type: "text" },
    { session_id: record.id, sender: "assistant", message_text: assistantMessage, message_type: "text" },
  ]);
  await db.from("chat_sessions").update({ current_stage: record.stage, answer_count: record.answerCount, updated_at: new Date().toISOString() }).eq("id", record.id);
  for (const [fact_key, fact_value] of Object.entries(record.facts)) {
    await db.from("assessment_facts").upsert({ session_id: record.id, fact_key, fact_value }, { onConflict: "session_id,fact_key" });
  }
}

export async function saveContact(record: SessionRecord, contact: LeadContact) {
  const db = supabase();
  record.lead = contact;
  if (!db) { memory.set(record.id, record); return; }
  const { data, error } = await db.from("leads").insert({
    full_name: contact.fullName, email: contact.email, company_name: contact.companyName,
    role_title: contact.roleTitle, consent_to_contact: contact.consentToContact, source: "readiness_check",
  }).select("id").single();
  if (error) throw error;
  await db.from("chat_sessions").update({ lead_id: data.id }).eq("id", record.id);
}

export async function completeSession(record: SessionRecord) {
  const db = supabase();
  record.completedAt = new Date().toISOString();
  if (!db) { memory.set(record.id, record); return; }
  await db.from("chat_sessions").update({
    session_status: "completed", current_stage: "completed", completed_at: record.completedAt,
    readiness_score: record.score?.total, readiness_category: record.score?.category,
    recommended_service: record.recommendation?.recommendedService, summary: record.recommendation?.workflowSummary,
  }).eq("id", record.id);
  await db.from("readiness_scores").upsert({
    session_id: record.id, workflow_clarity_score: record.score?.workflowClarity, repetition_score: record.score?.repetition,
    data_tool_readiness_score: record.score?.dataToolReadiness, business_impact_score: record.score?.businessImpact,
    risk_manageability_score: record.score?.riskManageability, total_score: record.score?.total,
    category: record.score?.category, rationale: record.score?.rationale,
  }, { onConflict: "session_id" });
  await db.from("recommendations").upsert({
    session_id: record.id, recommended_service: record.recommendation?.recommendedService,
    recommendation_summary: record.recommendation?.opportunity, suggested_first_project: record.recommendation?.firstProject,
    risks_to_review: [record.recommendation?.blocker], next_step: record.recommendation?.nextAction,
  }, { onConflict: "session_id" });
}
