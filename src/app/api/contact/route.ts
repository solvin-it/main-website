import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { rateLimit } from "@/lib/server";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  company: z.string().max(160).optional(),
  message: z.string().trim().min(20).max(3000),
  website: z.string().max(0).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!await rateLimit(`contact:${ip}`, 5, 60_000)) return NextResponse.json({ error: "Too many submissions." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: parsed.data.email,
        subject: `Solvin website inquiry from ${parsed.data.name}`,
        text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nCompany: ${parsed.data.company ?? "Not provided"}\n\n${parsed.data.message}`,
      });
      if (result.error) throw new Error(result.error.message);
    } catch {
      return NextResponse.json({ error: "The inquiry could not be delivered. Please try again." }, { status: 502 });
    }
  } else {
    return NextResponse.json({ error: "Email delivery is not configured yet. Please try again later." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
