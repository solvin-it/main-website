import OpenAI from "openai";
import { z } from "zod";
import { extractFallback, fallbackRecommendation, questions } from "./assessment";
import { extractContactDetailsFallback } from "./contact-details";
import type { AssessmentFacts, AssessmentStage, DiscoveryTopic, LeadContact, ReadinessScore, Recommendation } from "./types";

const optionalString = z.string().nullable().optional();
const discoveryTopics = ["opening", "context", "audience", "ideal_client", "offer", "pain_point", "desired_outcome", "success_metric", "workflow_clarity", "current_acquisition", "core_task", "tools_data", "credibility", "source_information", "risk"] as const;
const extractionSchema = z.object({
  acknowledgment: z.string().transform(value => value.slice(0, 240)),
  insight: z.string().nullable().optional().transform(value => value?.slice(0, 240)),
  suggestedTopic: z.enum(discoveryTopics).nullable().optional(),
  question: z.string().nullable().optional().transform(value => value?.slice(0, 300)),
  facts: z.object({
    projectType: z.enum(["website", "web_application", "mobile_application", "desktop_application", "ai_system", "operational_system", "unsure"]).nullable().optional(),
    businessType: optionalString, teamFunction: optionalString, projectGoal: optionalString, targetUsers: optionalString,
    currentSituation: optionalString, desiredOutcome: optionalString, constraints: optionalString,
    workflowName: optionalString, frequency: optionalString, painPoint: optionalString,
    tools: z.array(z.string()).nullable().optional(), existingAssets: z.array(z.string()).nullable().optional(),
    dataShape: z.enum(["structured", "unstructured", "mixed", "unknown"]).nullable().optional(),
    processConsistency: z.enum(["mostly_same", "sometimes_changes", "changes_often", "unknown"]).nullable().optional(),
    businessImpact: z.enum(["low", "medium", "high", "unknown"]).nullable().optional(),
    humanApproval: z.enum(["always", "sometimes", "not_needed", "unknown"]).nullable().optional(),
    sensitiveData: z.boolean().nullable().optional(),
    idealClient: optionalString, offer: optionalString, successMetric: optionalString, coreTask: optionalString,
    acquisitionChannels: z.array(z.string()).nullable().optional(), credibilityAssets: z.array(z.string()).nullable().optional(),
    sourceInformation: z.array(z.string()).nullable().optional(),
  }).transform(facts => Object.fromEntries(Object.entries(facts).filter(([, value]) => value !== null))),
});

const recommendationSchema = z.object({
  workflowSummary: z.string(), opportunity: z.string(), blocker: z.string(), firstProject: z.string(),
  recommendedService: z.string(), nextAction: z.string(),
});

const contactDetailsSchema = z.object({
  fullName: z.string().min(2).max(120).nullable(),
  email: z.string().email().max(254).nullable(),
  companyName: z.string().max(160).nullable(),
  roleTitle: z.string().max(160).nullable(),
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

function client() {
  return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15_000, maxRetries: 1 }) : null;
}

async function structuredResponse<T>(name: string, schema: Record<string, unknown>, input: string): Promise<T | null> {
  const openai = client();
  if (!openai) return null;
  try {
    const response = await openai.responses.create({
      model: MODEL,
      store: false,
      reasoning: { effort: "none" },
      instructions: "You are The Assistant on Solvin's website. You help nontechnical business owners shape websites, web applications, mobile or desktop applications, AI systems, and internal business software. Ask less, infer carefully, never force an automation framing, and never request sensitive records. Be concise, specific, and honest about uncertainty.",
      input,
      text: { format: { type: "json_schema", name, strict: true, schema } },
    });
    return JSON.parse(response.output_text) as T;
  } catch {
    return null;
  }
}

const extractionJsonSchema = {
  type: "object", additionalProperties: false, required: ["acknowledgment", "insight", "suggestedTopic", "question", "facts"],
  properties: {
    acknowledgment: { type: "string" },
    insight: { type: ["string", "null"] },
    suggestedTopic: { type: ["string", "null"], enum: [...discoveryTopics, null] },
    question: { type: ["string", "null"] },
    facts: {
      type: "object", additionalProperties: false,
      required: ["projectType", "businessType", "teamFunction", "projectGoal", "targetUsers", "currentSituation", "desiredOutcome", "constraints", "workflowName", "frequency", "painPoint", "tools", "existingAssets", "dataShape", "processConsistency", "businessImpact", "humanApproval", "sensitiveData", "idealClient", "offer", "acquisitionChannels", "credibilityAssets", "successMetric", "coreTask", "sourceInformation"],
      properties: {
        projectType: { type: ["string", "null"], enum: ["website", "web_application", "mobile_application", "desktop_application", "ai_system", "operational_system", "unsure", null] },
        businessType: { type: ["string", "null"] }, teamFunction: { type: ["string", "null"] }, projectGoal: { type: ["string", "null"] }, targetUsers: { type: ["string", "null"] }, currentSituation: { type: ["string", "null"] }, desiredOutcome: { type: ["string", "null"] }, constraints: { type: ["string", "null"] }, workflowName: { type: ["string", "null"] }, frequency: { type: ["string", "null"] }, painPoint: { type: ["string", "null"] },
        tools: { type: ["array", "null"], items: { type: "string" } }, existingAssets: { type: ["array", "null"], items: { type: "string" } },
        dataShape: { type: ["string", "null"], enum: ["structured", "unstructured", "mixed", "unknown", null] }, processConsistency: { type: ["string", "null"], enum: ["mostly_same", "sometimes_changes", "changes_often", "unknown", null] }, businessImpact: { type: ["string", "null"], enum: ["low", "medium", "high", "unknown", null] }, humanApproval: { type: ["string", "null"], enum: ["always", "sometimes", "not_needed", "unknown", null] }, sensitiveData: { type: ["boolean", "null"] },
        idealClient: { type: ["string", "null"] }, offer: { type: ["string", "null"] }, successMetric: { type: ["string", "null"] }, coreTask: { type: ["string", "null"] },
        acquisitionChannels: { type: ["array", "null"], items: { type: "string" } }, credibilityAssets: { type: ["array", "null"], items: { type: "string" } }, sourceInformation: { type: ["array", "null"], items: { type: "string" } },
      },
    },
  },
};

const recommendationJsonSchema = {
  type: "object", additionalProperties: false,
  required: ["workflowSummary", "opportunity", "blocker", "firstProject", "recommendedService", "nextAction"],
  properties: Object.fromEntries(["workflowSummary", "opportunity", "blocker", "firstProject", "recommendedService", "nextAction"].map(key => [key, { type: "string" }])),
};

const contactDetailsJsonSchema = {
  type: "object", additionalProperties: false,
  required: ["fullName", "email", "companyName", "roleTitle"],
  properties: {
    fullName: { type: ["string", "null"] },
    email: { type: ["string", "null"] },
    companyName: { type: ["string", "null"] },
    roleTitle: { type: ["string", "null"] },
  },
};

export async function analyzeAnswer(stage: AssessmentStage, answer: string, current: AssessmentFacts) {
  const result = await structuredResponse<unknown>("assessment_facts", extractionJsonSchema, `Current discovery topic: ${stage}\nFacts already established: ${JSON.stringify(current)}\nVisitor answer: ${answer}\nExtract every useful fact explicitly supported by this answer, even when it answers more than the current topic. Write a short acknowledgment that adds continuity without merely repeating the answer. Add one short insight only when it gives the visitor a useful interpretation; otherwise return null. Then suggest the single most useful unanswered discovery topic and phrase one easy question for it. Do not praise the visitor, summarize their biography, use ambiguous references such as “this” or “those people,” ask a compound question, or recommend a product prematurely. Do not mention a website, app, AI, automation, or another implementation unless the visitor explicitly requested it. The server will independently select and validate the topic.`);
  const parsed = extractionSchema.safeParse(result);
  return parsed.success ? parsed.data : { acknowledgment: "Understood.", insight: undefined, suggestedTopic: undefined, question: undefined, facts: extractFallback(stage, answer) };
}

export type AssistantTurnResult = { message: string; fallbackUsed: boolean; validationReason?: string };

export function validateAssistantMessage(message: string, context: string, allowRecommendation: boolean): string | null {
  const normalized = message.trim();
  const questionCount = (normalized.match(/\?/g) ?? []).length;
  const words = normalized.split(/\s+/).filter(Boolean).length;
  if (questionCount !== 1) return "response_must_contain_one_question";
  if (words < 8 || words > 80) return "response_length_out_of_range";
  if (/\b(this|these|those people)\b/i.test(normalized)) return "ambiguous_reference";
  if (/\b(great|excellent|amazing|impressive|credible specialty)\b/i.test(normalized)) return "generic_praise";
  if (/\b(you bring|your background|you are an?\b|your biography)\b/i.test(normalized)) return "biographical_recap";
  if (!allowRecommendation && /\b(i recommend|we should build|the solution is|website|\bsite\b|web application|\bapp\b|assistant|automation|internal system)\b/i.test(normalized)) return "premature_recommendation";
  const supportedNumbers = new Set(context.match(/\b\d+(?:\.\d+)?\b/g) ?? []);
  const unsupportedNumber = (normalized.match(/\b\d+(?:\.\d+)?\b/g) ?? []).find(number => !supportedNumbers.has(number));
  if (unsupportedNumber) return "unsupported_numeric_claim";
  return null;
}

export function createAssistantTurn(
  topic: DiscoveryTopic,
  facts: AssessmentFacts,
  visitorAnswer: string,
  acknowledgment: string,
  insight?: string,
  suggestedTopic?: DiscoveryTopic,
  suggestedQuestion?: string,
): AssistantTurnResult {
  const fallbackQuestion = questions[topic].message;
  const statedIntent = [facts.projectGoal, facts.painPoint, facts.desiredOutcome, visitorAnswer].filter(Boolean).join(" ");
  const productWasRequested = /\b(website|site|web app(?:lication)?|mobile app(?:lication)?|desktop app(?:lication)?|ai assistant|automation|internal system)\b/i.test(statedIntent);
  const allowRecommendation = Boolean(productWasRequested && (facts.businessType || facts.offer) && (facts.targetUsers || facts.idealClient) && (facts.desiredOutcome || facts.projectGoal));
  const contextualFallback = [acknowledgment, insight, fallbackQuestion].filter(Boolean).join(" ");
  const fallbackMessage = validateAssistantMessage(contextualFallback, JSON.stringify(facts), allowRecommendation) ? `Understood. ${fallbackQuestion}` : contextualFallback;
  if (suggestedTopic !== topic || !suggestedQuestion) {
    return { message: fallbackMessage, fallbackUsed: true, validationReason: "model_topic_mismatch" };
  }
  const candidate = [acknowledgment, insight, suggestedQuestion].filter(Boolean).join(" ");
  const validationReason = validateAssistantMessage(candidate, JSON.stringify({ facts, visitorAnswer }), allowRecommendation);
  return validationReason ? { message: fallbackMessage, fallbackUsed: true, validationReason } : { message: candidate.trim(), fallbackUsed: false };
}

export async function createRecommendation(facts: AssessmentFacts, score: ReadinessScore): Promise<Recommendation> {
  const result = await structuredResponse<unknown>("project_brief", recommendationJsonSchema, `Create a concrete project brief from these established facts: ${JSON.stringify(facts)}. Internal fit signal (do not mention or expose it): ${JSON.stringify(score)}. Every section must use the visitor's facts where available. Cover the actual project type; do not assume automation or AI unless requested. Phrase unknowns as decisions to confirm, never as generic filler. Recommend the smallest valuable first release and one accurate Solvin service.`);
  const parsed = recommendationSchema.safeParse(result);
  return parsed.success ? parsed.data : fallbackRecommendation(facts, score);
}

export async function extractContactDetails(
  answer: string,
  requestedField: "name" | "email" | "company",
  current: Partial<LeadContact>,
): Promise<Partial<LeadContact>> {
  const result = await structuredResponse<unknown>(
    "contact_details",
    contactDetailsJsonSchema,
    `Contact details already established: ${JSON.stringify(current)}\nThe Assistant most recently asked for: ${requestedField}\nVisitor reply: ${answer}\nExtract only contact details explicitly provided or corrected in the visitor reply. Understand natural phrasing, multiple details in one reply, affiliations, and corrections. An affiliation may be the company or organization. Never infer or invent a value. Return null for every detail not present in this reply.`,
  );
  const parsed = contactDetailsSchema.safeParse(result);
  if (!parsed.success) return extractContactDetailsFallback(answer, requestedField);
  return Object.fromEntries(Object.entries(parsed.data).filter(([, value]) => value !== null));
}
