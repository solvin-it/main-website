import { createClient } from "@supabase/supabase-js";
import type { AssessmentFacts, AssessmentStage, LeadContact, ReadinessCategory, ReadinessScore, Recommendation } from "./types";

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

interface RelatedScore {
  workflow_clarity_score: number;
  repetition_score: number;
  data_tool_readiness_score: number;
  business_impact_score: number;
  risk_manageability_score: number;
  total_score: number;
  category: ReadinessCategory;
  rationale: string | null;
}

interface RelatedRecommendation {
  recommended_service: string;
  recommendation_summary: string;
  suggested_first_project: string | null;
  risks_to_review: string[] | null;
  next_step: string | null;
}

interface RelatedLead {
  full_name: string;
  email: string;
  company_name: string | null;
  role_title: string | null;
  consent_to_contact: boolean;
}

interface SessionRow {
  id: string;
  current_stage: AssessmentStage;
  answer_count: number | null;
  entry_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  completed_at: string | null;
  summary: string | null;
  assessment_facts?: Array<{ fact_key: string; fact_value: unknown }> | null;
  readiness_scores?: RelatedScore | RelatedScore[] | null;
  recommendations?: RelatedRecommendation | RelatedRecommendation[] | null;
  lead?: RelatedLead | RelatedLead[] | null;
}

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

function firstRelated<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

export function sessionFromRow(data: SessionRow): SessionRecord {
  const facts = Object.fromEntries((data.assessment_facts ?? []).map(fact => [fact.fact_key, fact.fact_value])) as AssessmentFacts;
  const storedScore = firstRelated(data.readiness_scores);
  const storedRecommendation = firstRelated(data.recommendations);
  const storedLead = firstRelated(data.lead);
  const utm = {
    ...(data.utm_source ? { source: data.utm_source } : {}),
    ...(data.utm_medium ? { medium: data.utm_medium } : {}),
    ...(data.utm_campaign ? { campaign: data.utm_campaign } : {}),
  };

  const score: ReadinessScore | undefined = storedScore ? {
    workflowClarity: storedScore.workflow_clarity_score,
    repetition: storedScore.repetition_score,
    dataToolReadiness: storedScore.data_tool_readiness_score,
    businessImpact: storedScore.business_impact_score,
    riskManageability: storedScore.risk_manageability_score,
    total: storedScore.total_score,
    category: storedScore.category,
    rationale: storedScore.rationale ?? "",
  } : undefined;

  const recommendation: Recommendation | undefined = storedRecommendation ? {
    workflowSummary: data.summary ?? facts.painPoint ?? facts.workflowName ?? "The recurring workflow you described",
    opportunity: storedRecommendation.recommendation_summary,
    blocker: storedRecommendation.risks_to_review?.[0] ?? "Approval rules and exception handling should be confirmed.",
    firstProject: storedRecommendation.suggested_first_project ?? "",
    recommendedService: storedRecommendation.recommended_service,
    nextAction: storedRecommendation.next_step ?? "",
  } : undefined;

  const lead: LeadContact | undefined = storedLead ? {
    fullName: storedLead.full_name,
    email: storedLead.email,
    ...(storedLead.company_name ? { companyName: storedLead.company_name } : {}),
    ...(storedLead.role_title ? { roleTitle: storedLead.role_title } : {}),
    consentToContact: storedLead.consent_to_contact,
  } : undefined;

  return {
    id: data.id,
    stage: data.current_stage,
    answerCount: data.answer_count ?? 0,
    facts,
    ...(data.entry_page ? { entryPage: data.entry_page } : {}),
    ...(Object.keys(utm).length ? { utm } : {}),
    ...(score ? { score } : {}),
    ...(recommendation ? { recommendation } : {}),
    ...(lead ? { lead } : {}),
    ...(data.completed_at ? { completedAt: data.completed_at } : {}),
  };
}

async function persistAssessmentOutcome(db: NonNullable<ReturnType<typeof supabase>>, record: SessionRecord) {
  if (!record.score || !record.recommendation) return;
  const { error: sessionError } = await db.from("chat_sessions").update({
    readiness_score: record.score.total,
    readiness_category: record.score.category,
    recommended_service: record.recommendation.recommendedService,
    summary: record.recommendation.workflowSummary,
  }).eq("id", record.id);
  if (sessionError) throw sessionError;

  const { error: scoreError } = await db.from("readiness_scores").upsert({
    session_id: record.id,
    workflow_clarity_score: record.score.workflowClarity,
    repetition_score: record.score.repetition,
    data_tool_readiness_score: record.score.dataToolReadiness,
    business_impact_score: record.score.businessImpact,
    risk_manageability_score: record.score.riskManageability,
    total_score: record.score.total,
    category: record.score.category,
    rationale: record.score.rationale,
  }, { onConflict: "session_id" });
  if (scoreError) throw scoreError;

  const { error: recommendationError } = await db.from("recommendations").upsert({
    session_id: record.id,
    recommended_service: record.recommendation.recommendedService,
    recommendation_summary: record.recommendation.opportunity,
    suggested_first_project: record.recommendation.firstProject,
    risks_to_review: [record.recommendation.blocker],
    next_step: record.recommendation.nextAction,
  }, { onConflict: "session_id" });
  if (recommendationError) throw recommendationError;
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
  const { data, error } = await db.from("chat_sessions")
    .select("*, assessment_facts(fact_key,fact_value), readiness_scores(*), recommendations(*), lead:leads(full_name,email,company_name,role_title,consent_to_contact)")
    .eq("id", id)
    .single();
  if (error) return null;
  if (!data) return null;
  return sessionFromRow(data as unknown as SessionRow);
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
  await persistAssessmentOutcome(db, record);
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
  }).eq("id", record.id);
  await persistAssessmentOutcome(db, record);
}
