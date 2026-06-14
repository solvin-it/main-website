import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AssessmentFacts, AssessmentStage, Recommendation } from "./types";
import { extractFallback, fallbackRecommendation } from "./assessment";
import type { ReadinessScore } from "./types";

const factsSchema = z.object({
  // Trim rather than reject: a long acknowledgment must never discard valid facts.
  acknowledgment: z.string().transform(value => value.slice(0, 240)),
  facts: z.object({
    businessType: z.string().optional(),
    teamFunction: z.string().optional(),
    workflowName: z.string().optional(),
    frequency: z.string().optional(),
    tools: z.array(z.string()).optional(),
    dataShape: z.enum(["structured", "unstructured", "mixed", "unknown"]).optional(),
    processConsistency: z.enum(["mostly_same", "sometimes_changes", "changes_often", "unknown"]).optional(),
    businessImpact: z.enum(["low", "medium", "high", "unknown"]).optional(),
    humanApproval: z.enum(["always", "sometimes", "not_needed", "unknown"]).optional(),
    sensitiveData: z.boolean().optional(),
    painPoint: z.string().optional(),
  }),
});

const recommendationSchema = z.object({
  workflowSummary: z.string(),
  opportunity: z.string(),
  blocker: z.string(),
  firstProject: z.string(),
  recommendedService: z.string(),
  nextAction: z.string(),
});

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function client() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 12_000, maxRetries: 0 });
}

async function callTool<T>(
  name: string,
  description: string,
  schema: { type: "object"; properties?: Record<string, unknown>; required?: string[]; additionalProperties?: boolean },
  prompt: string,
  // Strict mode guarantees schema-valid tool input, but requires every object property to
  // be listed in `required`. Only enable it for schemas that satisfy that constraint.
  strict = false,
): Promise<T | null> {
  const anthropic = client();
  if (!anthropic) return null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 700,
        system: "You are Solvin Advisor, a calm workflow consultant. Never request sensitive records. Be concise and practical.",
        messages: [{ role: "user", content: prompt }],
        tools: [{ name, description, input_schema: schema, strict }],
        tool_choice: { type: "tool", name },
      });
      const block = response.content.find(item => item.type === "tool_use");
      if (block?.type === "tool_use") return block.input as T;
    } catch {
      if (attempt === 1) return null;
    }
  }
  return null;
}

export async function analyzeAnswer(stage: AssessmentStage, answer: string, current: AssessmentFacts) {
  const result = await callTool<unknown>("record_assessment_answer", "Extract structured facts and a short acknowledgment.", {
    type: "object", additionalProperties: false, required: ["acknowledgment", "facts"],
    properties: {
      acknowledgment: { type: "string" },
      facts: {
        type: "object", additionalProperties: false,
        properties: {
          businessType: { type: "string" }, teamFunction: { type: "string" }, workflowName: { type: "string" },
          frequency: { type: "string" }, tools: { type: "array", items: { type: "string" } },
          dataShape: { type: "string", enum: ["structured", "unstructured", "mixed", "unknown"] },
          processConsistency: { type: "string", enum: ["mostly_same", "sometimes_changes", "changes_often", "unknown"] },
          businessImpact: { type: "string", enum: ["low", "medium", "high", "unknown"] },
          humanApproval: { type: "string", enum: ["always", "sometimes", "not_needed", "unknown"] },
          sensitiveData: { type: "boolean" }, painPoint: { type: "string" },
        },
      },
    },
  }, `Current stage: ${stage}\nCurrent facts: ${JSON.stringify(current)}\nVisitor answer: ${answer}\nExtract only facts supported by the answer.`);
  const parsed = factsSchema.safeParse(result);
  return parsed.success ? parsed.data : { acknowledgment: "Thank you. That gives me useful context.", facts: extractFallback(stage, answer) };
}

export async function createRecommendation(facts: AssessmentFacts, score: ReadinessScore): Promise<Recommendation> {
  const result = await callTool<unknown>("create_recommendation", "Create the final practical readiness recommendation.", {
    type: "object", additionalProperties: false,
    required: ["workflowSummary", "opportunity", "blocker", "firstProject", "recommendedService", "nextAction"],
    properties: Object.fromEntries(["workflowSummary", "opportunity", "blocker", "firstProject", "recommendedService", "nextAction"].map(key => [key, { type: "string" }])),
  }, `Facts: ${JSON.stringify(facts)}\nScore: ${JSON.stringify(score)}\nRecommend the smallest useful next step. Do not overpromise.`, true);
  const parsed = recommendationSchema.safeParse(result);
  return parsed.success ? parsed.data : fallbackRecommendation(facts, score);
}
