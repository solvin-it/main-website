import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ createSession: vi.fn() }));
vi.mock("@/lib/store", () => ({ createSession: mocks.createSession }));
vi.mock("@/lib/server", () => ({ rateLimit: vi.fn().mockResolvedValue(true) }));
import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createSession.mockResolvedValue({ id: "new-session", stage: "opening", facts: {}, answerCount: 0 });
});

describe("Starting assistant discovery", () => {
  it("adds an empty project preview without changing the opening API contract", async () => {
    const response = await POST(new NextRequest("http://localhost/api/chat/sessions", { method: "POST", body: "{}" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      sessionId: "new-session", stage: "opening", progress: 0,
      message: "What problem would you like help solving?",
      projectPreview: { answerCount: 0, currentFocus: "opening" },
    });
  });
});
