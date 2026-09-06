import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractContactDetails } from "@/lib/openai";
import { getSession } from "@/lib/store";

const schema = z.object({
  message: z.string().trim().min(1).max(1500),
  requestedField: z.enum(["name", "email", "company"]),
  current: z.object({
    fullName: z.string().max(120).optional(),
    email: z.string().email().max(254).optional(),
    companyName: z.string().max(160).optional(),
    roleTitle: z.string().max(160).optional(),
  }).default({}),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please enter valid contact information." }, { status: 400 });
  if (!await getSession(id)) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  const details = await extractContactDetails(parsed.data.message, parsed.data.requestedField, parsed.data.current);
  return NextResponse.json({ details });
}
