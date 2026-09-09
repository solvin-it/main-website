import { beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("openai", () => ({
  default: class {
    responses = { create };
  },
}));

import { analyzeAnswer, createAssistantTurn, extractContactDetails, validateAssistantMessage } from "./openai";

describe("analyzeAnswer", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    create.mockReset();
  });

  it("keeps extracted project facts and trims a long acknowledgment", async () => {
    create.mockResolvedValue({ output_text: JSON.stringify({ acknowledgment: "x".repeat(400), facts: { projectType: "website", projectGoal: "Generate qualified leads" } }) });
    const result = await analyzeAnswer("opening", "We need a website that generates qualified leads", {});
    expect(result.facts.projectType).toBe("website");
    expect(result.facts.projectGoal).toBe("Generate qualified leads");
    expect(result.acknowledgment.length).toBe(240);
  });

  it("uses a project-specific fallback when the model is unavailable", async () => {
    create.mockRejectedValue(new Error("unavailable"));
    const result = await analyzeAnswer("opening", "We need a web application for customers", {});
    expect(result.facts.projectType).toBe("web_application");
    expect(result.acknowledgment).toBe("Understood.");
  });
});

describe("extractContactDetails", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    create.mockReset();
  });

  it("accepts several contact details from one natural reply", async () => {
    create.mockResolvedValue({ output_text: JSON.stringify({
      fullName: "Morgan", email: "morgan@example.com", companyName: "Northstar Golf", roleTitle: null,
    }) });
    await expect(extractContactDetails("Natural multi-detail reply", "name", {})).resolves.toEqual({
      fullName: "Morgan", email: "morgan@example.com", companyName: "Northstar Golf",
    });
  });

  it("falls back deterministically when Luna is unavailable", async () => {
    create.mockRejectedValue(new Error("unavailable"));
    await expect(extractContactDetails(
      "Morgan. Email is at morgan@example.com. I am affiliated with Northstar Golf",
      "name",
      {},
    )).resolves.toEqual({ fullName: "Morgan", email: "morgan@example.com", companyName: "Northstar Golf" });
  });
});

describe("contextual assistant turns", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    create.mockReset();
  });

  it("rejects the ambiguous biographical recap from the fintech conversation", () => {
    const message = "You bring fintech leadership and Philippine-market compliance experience to a solo consulting practice. What should this make easier for those people?";
    expect(validateAssistantMessage(message, "{}", false)).toBe("ambiguous_reference");
  });

  it("rejects a premature product recommendation", () => {
    expect(validateAssistantMessage("We should build a website for the practice. Who is the ideal client?", "{}", false)).toBe("premature_recommendation");
  });

  it("falls back to the server-selected ideal-client question when wording fails validation", async () => {
    create.mockResolvedValue({ output_text: JSON.stringify({ message: "What is this for?" }) });
    const result = await createAssistantTurn("ideal_client", { businessType: "Fintech consulting" }, "I advise fintech firms.", "Understood.");
    expect(result.fallbackUsed).toBe(true);
    expect(result.message).toContain("Who would be the ideal client");
  });

  it("accepts model wording only when its topic matches the server plan", () => {
    const result = createAssistantTurn(
      "success_metric",
      { businessType: "Fintech consulting", idealClient: "Overseas fintech companies", projectGoal: "Generate leads" },
      "Overseas fintech companies are the best fit.",
      "That narrows the audience.",
      "The positioning can focus on Philippine market entry.",
      "success_metric",
      "What measurable result would make the lead-generation effort successful?",
    );
    expect(result.fallbackUsed).toBe(false);
    expect(result.message).toContain("lead-generation effort");
  });
});
