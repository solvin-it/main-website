import { Resend } from "resend";
import type { SessionRecord } from "./store";

export type BriefDelivery = "sent" | "not_configured";

function briefText(session: SessionRecord) {
  const lead = session.lead;
  const recommendation = session.recommendation;
  if (!lead || !recommendation) throw new Error("The project brief is missing contact or recommendation details.");

  return [
    `Project brief: ${recommendation.workflowSummary}`,
    "", "What success looks like", recommendation.opportunity,
    "", "Decisions to confirm", recommendation.blocker,
    "", "Recommended first release", recommendation.firstProject,
    "", "How Solvin can help", recommendation.recommendedService,
    "", "Next action", recommendation.nextAction,
    "", "This is a starting brief prepared from your conversation. It is not a final scope, quote, or guarantee of feasibility.",
  ].join("\n");
}

export async function deliverProjectBrief(session: SessionRecord): Promise<BriefDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) return "not_configured";
  if (!session.lead?.consentToContact || !session.recommendation) {
    throw new Error("Consent and a completed project brief are required before delivery.");
  }

  const resend = new Resend(apiKey);
  const text = briefText(session);
  const subject = `Project brief: ${session.recommendation.workflowSummary}`.slice(0, 180);
  const prospect = await resend.emails.send({
    from,
    to: session.lead.email,
    replyTo: to,
    subject,
    text: `Hello ${session.lead.fullName},\n\nHere is the starting project brief prepared from your conversation with the Solvin Assistant.\n\n${text}\n\nReply to this email if anything needs correcting.\n\nSolvin`,
  }, { idempotencyKey: `brief-prospect-${session.id}` });
  if (prospect.error) throw new Error(`Prospect brief delivery failed: ${prospect.error.message}`);

  const internal = await resend.emails.send({
    from,
    to,
    replyTo: session.lead.email,
    subject: `New Solvin inquiry — ${session.recommendation.workflowSummary}`.slice(0, 180),
    text: `Name: ${session.lead.fullName}\nEmail: ${session.lead.email}\nCompany: ${session.lead.companyName ?? "Not provided"}\nSession: ${session.id}\n\n${text}`,
  }, { idempotencyKey: `brief-internal-${session.id}` });
  if (internal.error) throw new Error(`Internal brief delivery failed: ${internal.error.message}`);
  return "sent";
}
