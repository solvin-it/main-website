import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, saveContact } from "@/lib/store";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  companyName: z.string().max(160).optional(),
  roleTitle: z.string().max(160).optional(),
  consentToContact: z.literal(true),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Valid contact details and consent are required." }, { status: 400 });
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  await saveContact(session, parsed.data);
  return NextResponse.json({ ok: true });
}
