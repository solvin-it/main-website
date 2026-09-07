import { NextRequest, NextResponse } from "next/server";
import { completeSession, getSession } from "@/lib/store";
import { deliverProjectBrief } from "@/lib/email";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!session.score || !session.recommendation) return NextResponse.json({ error: "Assessment is not ready." }, { status: 409 });
  if (!session.lead?.consentToContact) return NextResponse.json({ error: "Contact details and consent are required." }, { status: 409 });
  let delivery: "sent" | "not_configured" = "not_configured";
  if (!session.completedAt) {
    try {
      delivery = await deliverProjectBrief(session);
      if (delivery === "not_configured") {
        return NextResponse.json({ error: "Your details were saved, but email delivery is not configured yet. Please try again later." }, { status: 503 });
      }
      session.stage = "completed";
      await completeSession(session);
    } catch {
      return NextResponse.json({ error: "Your details were saved, but the brief could not be sent. Please try again." }, { status: 502 });
    }
  } else {
    delivery = "sent";
  }
  return NextResponse.json({ ok: true, delivery, score: session.score, recommendation: session.recommendation });
}
