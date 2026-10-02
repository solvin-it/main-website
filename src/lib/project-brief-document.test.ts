import { describe, expect, it } from "vitest";
import type { ProjectPreview, Recommendation } from "./types";
import { formatProjectBriefDocument } from "./project-brief-document";

const recommendation: Recommendation = {
  workflowSummary: "A support assistant for a growing studio.",
  opportunity: "Answer common questions with a useful first draft.",
  blocker: "Confirm approval rules and available source material.",
  firstProject: "Build one support flow with a person approving replies.",
  recommendedService: "AI assistant design and development",
  nextAction: "Review the brief together and agree on the first support flow.",
};

function parse(html: string) {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("Standalone project brief document", () => {
  it("keeps all brief sections and confirmed project context in a readable document", () => {
    const preview: ProjectPreview = {
      answerCount: 6, service: "AI agent", goal: "Reduce repetitive support work", audience: "Our support team",
      desiredOutcome: "The team spends more time on difficult requests", successMetric: "Resolve 50 requests a day",
      constraints: "A person approves every reply", tools: ["Notion", "Email"],
    };
    const document = parse(formatProjectBriefDocument(recommendation, preview));
    expect(document.title).toBe("Your project brief · Solvin");
    for (const value of Object.values(recommendation)) expect(document.body.textContent).toContain(value);
    for (const value of [preview.service, preview.goal, preview.audience, preview.desiredOutcome, preview.successMetric, preview.constraints, "Notion · Email"]) {
      expect(document.body.textContent).toContain(value);
    }
    expect([...document.querySelectorAll("h2")].map(heading => heading.textContent)).toEqual([
      "A useful first release", "What success looks like", "Decisions to confirm", "How Solvin helps", "The next step",
    ]);
    expect(document.querySelector("footer")?.textContent).toContain("draft for discussion");
    expect(document.querySelector("footer")?.textContent).toContain("scope, timing, cost");
  });

  it("escapes provider and visitor strings as text without creating active elements", () => {
    const attack = `<script>alert('unsafe')</script><img src="https://evil.example/image" onerror="alert(1)"><a href="javascript:alert(1)">& 'quoted' "text"</a>`;
    const unsafeRecommendation = Object.fromEntries(Object.keys(recommendation).map(key => [key, attack])) as unknown as Recommendation;
    const html = formatProjectBriefDocument(unsafeRecommendation, {
      answerCount: 6, service: attack, goal: attack, audience: attack, desiredOutcome: attack,
      successMetric: attack, constraints: attack, tools: [attack],
    });
    const document = parse(html);
    expect(document.querySelectorAll("script, img, a, iframe, object, embed, form")).toHaveLength(0);
    expect(document.querySelectorAll("[onerror], [onclick], [src], [href]")).toHaveLength(0);
    expect(document.querySelector(".summary")?.textContent).toBe(attack);
    expect(document.querySelector(".service")?.textContent).toBe(attack);
    expect(document.querySelector(".metric p")?.textContent).toBe(attack);
    expect(document.querySelector(".tools p")?.textContent).toBe(attack);
    expect(html).toContain("&lt;script&gt;alert(&#39;unsafe&#39;)&lt;/script&gt;");
    expect(html).toContain("&amp; &#39;quoted&#39; &quot;text&quot;");
  });

  it("works offline without external assets, scripts, fonts, or network connections", () => {
    const html = formatProjectBriefDocument(recommendation);
    const document = parse(html);
    expect(document.querySelectorAll("link, script, img, iframe, video, audio, source")).toHaveLength(0);
    expect(html).not.toMatch(/https?:\/\/|@import|@font-face|url\s*\(/i);
    expect(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute("content")).toContain("default-src 'none'");
    expect(html).toContain("@page { size: A4;");
    expect(html).toContain("@media print");
    expect(html).toContain("break-inside: avoid");
    expect(html).toContain("Save as PDF");
  });

  it("preserves line breaks and avoids inventing context when preview facts are missing", () => {
    const html = formatProjectBriefDocument({ ...recommendation, nextAction: "Review the brief.\nChoose a first release." });
    const document = parse(html);
    expect(document.querySelector(".next p")?.textContent).toBe("Review the brief.\nChoose a first release.");
    expect(html).toContain("white-space: pre-line");
    expect(document.querySelector(".service")?.textContent).toBe(recommendation.recommendedService);
    expect(document.querySelector(".context")).toBeNull();
    expect(document.querySelector(".metric")).toBeNull();
    expect(document.querySelector(".constraint")).toBeNull();
    expect(document.body.textContent).not.toContain("undefined");
  });
});
