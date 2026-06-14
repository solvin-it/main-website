import { beforeEach, describe, expect, it, vi } from "vitest";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

import { analyzeAnswer } from "./claude";

describe("analyzeAnswer", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    create.mockReset();
  });

  it("keeps Claude's extracted facts when the acknowledgment exceeds 240 chars", async () => {
    const longAck = "x".repeat(400);
    create.mockResolvedValue({
      content: [{ type: "tool_use", input: { acknowledgment: longAck, facts: { businessType: "Bakery" } } }],
    });

    const result = await analyzeAnswer("opening", "We run a bakery", {});

    // The model's facts survive; only the acknowledgment is trimmed.
    expect(result.facts.businessType).toBe("Bakery");
    expect(result.acknowledgment.length).toBe(240);
  });

  it("falls back to deterministic extraction when Claude returns no tool call", async () => {
    create.mockResolvedValue({ content: [] });

    const result = await analyzeAnswer("opening", "We run a bakery", {});

    expect(result.facts.businessType).toBe("We run a bakery");
    expect(result.acknowledgment).toBe("Thank you. That gives me useful context.");
  });
});
