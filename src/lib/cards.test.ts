import { describe, expect, it } from "vitest";
import { buildVCard, cards, cardUrl, getCard, initials } from "@/lib/cards";

describe("cards", () => {
  it("has the two team cards with unique slugs", () => {
    expect(cards.map(card => card.slug)).toEqual(["fernando", "david"]);
    expect(new Set(cards.map(card => card.slug)).size).toBe(cards.length);
  });

  it("looks up cards case-insensitively and returns undefined for unknown slugs", () => {
    expect(getCard("FERNANDO")?.givenName).toBe("Jose Fernando");
    expect(getCard("nobody")).toBeUndefined();
  });

  it("builds initials and absolute card urls", () => {
    expect(initials(getCard("david")!)).toBe("DG");
    expect(cardUrl(getCard("fernando")!)).toMatch(/^https?:\/\/.+\/card\/fernando$/);
  });
});

describe("buildVCard", () => {
  it("emits a CRLF vCard 3.0 with name, title, org and email", () => {
    const vcard = buildVCard(getCard("fernando")!);
    expect(vcard.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(vcard.endsWith("END:VCARD\r\n")).toBe(true);
    expect(vcard).toContain("N:Gonzales;Jose Fernando;;;");
    expect(vcard).toContain("FN:Jose Fernando Gonzales");
    expect(vcard).toContain("TITLE:Founder");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET,WORK:josefernando.a.gonzales@gmail.com");
  });

  it("escapes special characters and folds long lines to 75 octets", () => {
    const vcard = buildVCard({ ...getCard("david")!, title: "Engineer, Platform; Lead\\Ops" });
    expect(vcard).toContain("TITLE:Engineer\\, Platform\; Lead\\\\Ops");
    const long = buildVCard({ ...getCard("david")!, organization: "A".repeat(200) });
    for (const line of long.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
