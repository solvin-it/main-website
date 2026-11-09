export type TeamCard = {
  slug: string;
  givenName: string;
  familyName: string;
  title: string;
  organization: string;
  email: string;
  /** Short line shown under the title on the card. */
  tagline: string;
  /** Shown only for people who take discovery calls (needs NEXT_PUBLIC_CALCOM_URL). */
  bookable?: boolean;
};

export const cards: TeamCard[] = [
  {
    slug: "fernand9",
    givenName: "Jose Fernando",
    familyName: "Gonzales",
    title: "Founder",
    organization: "Solvin",
    email: "josefernando.a.gonzales@gmail.com",
    tagline: "Beautiful websites. Brilliant agents.",
    bookable: true,
  },
  {
    slug: "david",
    givenName: "David Angelo",
    familyName: "Gonzales",
    title: "Software Engineer",
    organization: "Solvin",
    email: "gonzales.davidangelo@gmail.com",
    tagline: "Thoughtful engineering for intelligent systems.",
  },
];

export function getCard(slug: string) {
  return cards.find(card => card.slug === slug.toLowerCase());
}

export function fullName(card: TeamCard) {
  return `${card.givenName} ${card.familyName}`;
}

export function initials(card: TeamCard) {
  return `${card.givenName[0]}${card.familyName[0]}`.toUpperCase();
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://solvin.co").replace(/\/$/, "");
}

export function cardUrl(card: TeamCard) {
  return `${siteUrl()}/card/${card.slug}`;
}

function escapeValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\;").replace(/,/g, "\\,");
}

// RFC 6350/2425 folding: lines longer than 75 octets continue on a line starting with one space.
function fold(line: string) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const charSize = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (size + charSize > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += charSize;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** vCard 3.0 — the version every phone contacts app imports. */
export function buildVCard(card: TeamCard) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeValue(card.familyName)};${escapeValue(card.givenName)};;;`,
    `FN:${escapeValue(fullName(card))}`,
    `ORG:${escapeValue(card.organization)}`,
    `TITLE:${escapeValue(card.title)}`,
    `EMAIL;TYPE=INTERNET,WORK:${card.email}`,
    `URL:${siteUrl()}`,
    `NOTE:${escapeValue(`${card.organization} · ${cardUrl(card)}`)}`,
    "END:VCARD",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
