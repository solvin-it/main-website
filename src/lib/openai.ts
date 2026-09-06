import OpenAI from "openai";
import { z } from "zod";
import { extractFallback, fallbackRecommendation } from "./assessment";
import { extractContactDetailsFallback } from "./contact-details";
import type { AssessmentFacts, AssessmentStage, LeadContact, ReadinessScore, Recommendation } from "./types";

const optionalString = z.string().nullable().optional();
const extractionSchema = z.object({
  acknowledgment: z.string().transform(value => value.slice(0, 240)),
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
  type: "object", additionalProperties: false, required: ["acknowledgment", "facts"],
  properties: {
    acknowledgment: { type: "string" },
    facts: {
      type: "object", additionalProperties: false,
      required: ["projectType", "businessType", "teamFunction", "projectGoal", "targetUsers", "currentSituation", "desiredOutcome", "constraints", "workflowName", "frequency", "painPoint", "tools", "existingAssets", "dataShape", "processConsistency", "businessImpact", "humanApproval", "sensitiveData"],
      properties: {
        projectType: { type: ["string", "null"], enum: ["website", "web_application", "mobile_application", "desktop_application", "ai_system", "operational_system", "unsure", null] },
        businessType: { type: ["string", "null"] }, teamFunction: { type: ["string", "null"] }, projectGoal: { type: ["string", "null"] }, targetUsers: { type: ["string", "null"] }, currentSituation: { type: ["string", "null"] }, desiredOutcome: { type: ["string", "null"] }, constraints: { type: ["string", "null"] }, workflowName: { type: ["string", "null"] }, frequency: { type: ["string", "null"] }, painPoint: { type: ["string", "null"] },
        tools: { type: ["array", "null"], items: { type: "string" } }, existingAssets: { type: ["array", "null"], items: { type: "string" } },
        dataShape: { type: ["string", "null"], enum: ["structured", "unstructured", "mixed", "unknown", null] }, processConsistency: { type: ["string", "null"], enum: ["mostly_same", "sometimes_changes", "changes_often", "unknown", null] }, businessImpact: { type: ["string", "null"], enum: ["low", "medium", "high", "unknown", null] }, humanApproval: { type: ["string", "null"], enum: ["always", "sometimes", "not_needed", "unknown", null] }, sensitiveData: { type: ["boolean", "null"] },
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
  const result = await structuredResponse<unknown>("assessment_facts", extractionJsonSchema, `Current stage: ${stage}\nFacts already established: ${JSON.stringify(current)}\nVisitor answer: ${answer}\nExtract only facts supported by this answer. Acknowledge the substance in one short sentence; do not repeat the next question.`);
  const parsed = extractionSchema.safeParse(result);
  return parsed.success ? parsed.data : { acknowledgment: "Understood. I have added that to the brief.", facts: extractFallback(stage, answer) };
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
