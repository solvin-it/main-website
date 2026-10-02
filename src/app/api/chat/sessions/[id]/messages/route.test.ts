import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { SessionRecord } from "@/lib/store";

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), saveTurn: vi.fn(), analyzeAnswer: vi.fn(), createRecommendation: vi.fn() }));
vi.mock("@/lib/store", () => ({ getSession: mocks.getSession, saveTurn: mocks.saveTurn }));
vi.mock("@/lib/server", () => ({ rateLimit: vi.fn().mockResolvedValue(true) }));
vi.mock("@/lib/openai", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/openai")>(), analyzeAnswer: mocks.analyzeAnswer, createRecommendation: mocks.createRecommendation }));
import { POST } from "./route";

let session: SessionRecord;
async function send(message: string) {
  const response = await POST(new NextRequest("http://localhost/api/chat/sessions/test/messages", { method: "POST", body: JSON.stringify({ message }) }), { params: Promise.resolve({ id: "test" }) });
  expect(response.status).toBe(200);
  return response.json();
}

beforeEach(() => {
  vi.clearAllMocks();
  session = { id: "test", stage: "context", facts: { projectGoal: "A customer portal" }, answerCount: 5 };
  mocks.getSession.mockResolvedValue(session);
  mocks.saveTurn.mockResolvedValue(undefined);
});

describe("Assistant conversation boundaries", () => {
  it("answers a service question without consuming the last discovery answer", async () => {
    const reply = await send("How much do you charge?");
    expect(reply.message).toContain("quote");
    expect(reply.stage).toBe("context");
    expect(session.answerCount).toBe(5);
    expect(mocks.analyzeAnswer).not.toHaveBeenCalled();
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
    expect(reply.projectPreview).toEqual({ answerCount: 5, goal: "A customer portal", currentFocus: "context" });
  });

  it("omits sensitive input without advancing or preparing a premature brief", async () => {
    const reply = await send("My password is secret123");
    expect(reply.message).toContain("leave out passwords");
    expect(session.stage).toBe("context");
    expect(session.answerCount).toBe(5);
    expect(mocks.saveTurn.mock.calls[0][1]).not.toContain("secret123");
    expect(mocks.analyzeAnswer).not.toHaveBeenCalled();
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
    expect(reply.projectPreview).toEqual({ answerCount: 5, goal: "A customer portal", currentFocus: "context" });
  });

  it("records uncertainty as a skipped topic rather than inventing project facts", async () => {
    session.answerCount = 1;
    const reply = await send("Not sure yet");
    expect(session.facts.skippedTopics).toContain("context");
    expect(session.facts.businessType).toBeUndefined();
    expect(mocks.analyzeAnswer).not.toHaveBeenCalled();
    expect(reply.projectPreview.answerCount).toBe(2);
    expect(JSON.stringify(reply.projectPreview)).not.toContain("Not sure");
  });

  it("updates the preview with confirmed facts on each discovery reply", async () => {
    session.answerCount = 1;
    session.facts.projectType = "web_application";
    mocks.analyzeAnswer.mockResolvedValue({ acknowledgment: "Understood.", facts: { businessType: "A design studio", targetUsers: "Our customers", tools: ["CRM"] } });
    const reply = await send("We are a design studio and our customers use the CRM.");
    expect(reply.projectPreview).toMatchObject({ answerCount: 2, projectType: "web_application", service: "Web application", goal: "A customer portal", audience: "Our customers", tools: ["CRM"] });
    expect(reply.projectPreview.currentFocus).toBe(reply.stage);
    expect(reply.recommendation).toBeUndefined();
  });

  it("includes the final confirmed preview alongside the prepared recommendation", async () => {
    mocks.analyzeAnswer.mockResolvedValue({ acknowledgment: "Understood.", facts: { projectType: "website", businessType: "A design studio", successMetric: "Five qualified enquiries a month" } });
    const recommendation = { recommendedService: "Website development", opportunity: "Show the studio's expertise" };
    mocks.createRecommendation.mockResolvedValue(recommendation);
    const reply = await send("We are a design studio.");
    expect(reply.stage).toBe("contact");
    expect(reply.recommendation).toEqual(recommendation);
    expect(reply.projectPreview).toEqual({ answerCount: 6, projectType: "website", service: "Website development", goal: "A customer portal", successMetric: "Five qualified enquiries a month" });
  });
});
