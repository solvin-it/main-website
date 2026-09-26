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
  });

  it("omits sensitive input without advancing or preparing a premature brief", async () => {
    const reply = await send("My password is secret123");
    expect(reply.message).toContain("leave out passwords");
    expect(session.stage).toBe("context");
    expect(session.answerCount).toBe(5);
    expect(mocks.saveTurn.mock.calls[0][1]).not.toContain("secret123");
    expect(mocks.analyzeAnswer).not.toHaveBeenCalled();
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
  });

  it("records uncertainty as a skipped topic rather than inventing project facts", async () => {
    session.answerCount = 1;
    await send("Not sure yet");
    expect(session.facts.skippedTopics).toContain("context");
    expect(session.facts.businessType).toBeUndefined();
    expect(mocks.analyzeAnswer).not.toHaveBeenCalled();
  });
});
