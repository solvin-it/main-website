import { beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("openai", () => ({
  default: class {
    responses = { create };
  },
}));

import { analyzeAnswer, extractContactDetails } from "./openai";

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
    expect(result.acknowledgment).toContain("added that to the brief");
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
