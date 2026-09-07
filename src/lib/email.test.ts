import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

import { deliverProjectBrief } from "./email";
import type { SessionRecord } from "./store";

const session: SessionRecord = {
  id: "session-1", stage: "contact", answerCount: 6, facts: {},
  lead: { fullName: "Morgan", email: "morgan@example.com", companyName: "Northstar", consentToContact: true },
  score: { workflowClarity: 80, repetition: 80, dataToolReadiness: 80, businessImpact: 80, riskManageability: 80, total: 80, category: "AI-Assisted Workflow Ready", rationale: "Ready." },
  recommendation: { workflowSummary: "Customer request handling", opportunity: "Respond consistently.", blocker: "Confirm ownership.", firstProject: "A request portal.", recommendedService: "Web application", nextAction: "Review the brief." },
};

describe("project brief delivery", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTACT_FROM_EMAIL = "Solvin <hello@solvin.co>";
    process.env.CONTACT_TO_EMAIL = "jose@solvin.co";
    send.mockReset().mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_FROM_EMAIL;
    delete process.env.CONTACT_TO_EMAIL;
  });

  it("sends prospect and internal briefs with idempotency keys", async () => {
    await expect(deliverProjectBrief(session)).resolves.toBe("sent");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].to).toBe("morgan@example.com");
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: "brief-prospect-session-1" });
    expect(send.mock.calls[1][0].to).toBe("jose@solvin.co");
    expect(send.mock.calls[1][1]).toEqual({ idempotencyKey: "brief-internal-session-1" });
  });

  it("does not claim delivery when email is unconfigured", async () => {
    delete process.env.RESEND_API_KEY;
    await expect(deliverProjectBrief(session)).resolves.toBe("not_configured");
    expect(send).not.toHaveBeenCalled();
  });
});
