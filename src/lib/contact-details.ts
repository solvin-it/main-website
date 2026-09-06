import type { LeadContact } from "@/lib/types";

type ContactField = "name" | "email" | "company";

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const companyPatterns = [
  /\b(?:i am|i'm)\s+(?:affiliated|associated)\s+with\s+([^.,;]+)/i,
  /\b(?:my\s+)?(?:company|organization|business)\s+(?:is|is called)\s+([^.,;]+)/i,
  /\bi (?:work|am) (?:at|with|for)\s+([^.,;]+)/i,
];

function clean(value: string) {
  return value.trim().replace(/^[\s,.;:-]+|[\s,.;:-]+$/g, "");
}

function nameFromText(text: string) {
  const firstThought = clean(text.split(/[.!?\n]/)[0] ?? "");
  const withoutIntroduction = firstThought.replace(/^(?:my name is|i am|i'm|call me)\s+/i, "");
  if (!withoutIntroduction || emailPattern.test(withoutIntroduction) || withoutIntroduction.length > 80) return undefined;
  return clean(withoutIntroduction);
}

export function extractContactDetailsFallback(text: string, requestedField: ContactField): Partial<LeadContact> {
  const answer = text.trim();
  const email = answer.match(emailPattern)?.[0];
  const companyName = companyPatterns.map(pattern => answer.match(pattern)?.[1]).find(Boolean);
  const fullName = nameFromText(answer);
  const extracted: Partial<LeadContact> = {};

  if (email) extracted.email = email;
  if (companyName) extracted.companyName = clean(companyName);
  if (fullName && requestedField === "name") extracted.fullName = fullName;

  if (requestedField === "name" && !extracted.fullName && !email) extracted.fullName = clean(answer);
  if (requestedField === "company" && !extracted.companyName && !email) extracted.companyName = clean(answer);

  return extracted;
}
