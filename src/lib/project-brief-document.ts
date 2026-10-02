import type { ProjectPreview, Recommendation } from "./types";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function paragraph(value: string, className = ""): string {
  return `<p${className ? ` class="${className}"` : ""}>${escapeHtml(value)}</p>`;
}

/** An offline document the visitor can keep, open, and print using their browser. */
export function formatProjectBriefDocument(recommendation: Recommendation, preview?: ProjectPreview): string {
  const context = [
    ...(preview?.goal ? [{ label: "Your goal", value: preview.goal }] : []),
    ...(preview?.audience ? [{ label: "For", value: preview.audience }] : []),
  ];
  const service = preview?.service ?? recommendation.recommendedService;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'">
  <title>Your project brief · Solvin</title>
  <style>
    :root { color-scheme: light; --paper: #faf9f2; --ink: #243f34; --muted: #667268; --line: #d8ded2; --sage: #e8eddf; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 40px 20px; color: var(--ink); background: #e9ece3; font: 14px/1.6 Arial, Helvetica, sans-serif; }
    main { width: min(100%, 820px); margin: auto; padding: 46px 54px 34px; background: var(--paper); box-shadow: 0 20px 70px #243f3410; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
    .wordmark { font-size: 35px; font-weight: 700; letter-spacing: -2.5px; line-height: 1; }
    .wordmark span { color: #81917a; }
    .edition, .eyebrow, dt { color: var(--muted); font-size: 10px; font-weight: 600; letter-spacing: 1.7px; text-transform: uppercase; }
    .edition { text-align: right; letter-spacing: 1.25px; }
    .intro { margin-top: 30px; }
    h1 { margin: 6px 0 18px; font: 46px/1.05 Georgia, 'Times New Roman', serif; letter-spacing: -1.6px; font-weight: 400; }
    h1 em { color: #778775; font-weight: 400; }
    .service { display: inline-block; max-width: 100%; margin-bottom: 10px; padding: 5px 11px; border: 1px solid var(--line); border-radius: 20px; color: #52644f; font-size: 11px; }
    p { margin: 0; white-space: pre-line; overflow-wrap: anywhere; }
    .summary { font-size: 17px; line-height: 1.5; }
    .context { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; margin: 20px 0 0; }
    dt { margin-bottom: 4px; font-size: 9px; letter-spacing: 1.2px; }
    dd { margin: 0; color: #526157; font-size: 12px; }
    .release { margin-top: 25px; padding: 20px 22px; background: var(--sage); border-left: 3px solid #8e9f80; }
    h2 { margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: .1px; }
    .release h2 { margin-bottom: 10px; color: #596b53; font-size: 10px; letter-spacing: 1.25px; text-transform: uppercase; }
    .release p { font: 20px/1.4 Georgia, 'Times New Roman', serif; }
    .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 28px; margin-top: 25px; }
    .sections section { border-top: 1px solid var(--line); padding-top: 13px; }
    .sections p { color: #536157; font-size: 12px; }
    .metric, .constraint, .outcome { margin-top: 10px; }
    .detail-label { display: block; margin-bottom: 3px; font-size: 9px; letter-spacing: 1.05px; font-weight: 600; text-transform: uppercase; color: #6c7a64; }
    .support { margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--line); }
    .support p { font-size: 12px; color: #536157; }
    .tools { margin-top: 9px; }
    .next { display: grid; grid-template-columns: 22px 1fr; gap: 12px; margin-top: 23px; padding: 17px 20px; background: #294738; color: #faf9f2; }
    .next .arrow { font-size: 22px; line-height: 1.1; }
    .next h2 { margin-bottom: 5px; }
    .next p { font-size: 12px; }
    footer { display: flex; justify-content: space-between; gap: 28px; margin-top: 24px; padding-top: 13px; border-top: 1px solid var(--line); }
    footer p { max-width: 520px; font-size: 9px; line-height: 1.6; color: var(--muted); }
    footer .footer-brand { font-size: 10px; letter-spacing: 1px; }
    .print-hint { max-width: 820px; margin: 16px auto 0; text-align: center; font-size: 11px; color: #667268; }
    section, .context > div, .next, footer { break-inside: avoid; page-break-inside: avoid; }
    h1, h2, dt { break-after: avoid; }
    p { orphans: 3; widows: 3; }
    @media (max-width: 600px) {
      body { padding: 14px; }
      main { padding: 28px 23px; }
      h1 { font-size: 38px; }
      .context, .sections { grid-template-columns: 1fr; }
      .edition { font-size: 8px; }
      footer { gap: 16px; }
    }
    @page { size: A4; margin: 16mm; }
    @media print {
      body { padding: 0; background: white; font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      main { width: 100%; margin: 0; padding: 0; box-shadow: none; }
      header { padding-bottom: 16px; }
      .intro { margin-top: 22px; }
      h1 { font-size: 37px; margin-bottom: 13px; }
      .summary { font-size: 15px; }
      .context, .sections { grid-template-columns: 1fr 1fr; }
      .release { margin-top: 20px; padding: 17px 19px; }
      .release p { font-size: 18px; }
      .sections { margin-top: 20px; gap: 18px 25px; }
      .support { margin-top: 17px; }
      .next { margin-top: 19px; padding: 14px 17px; }
      footer { margin-top: 20px; }
      .print-hint { display: none; }
    }
  </style>
</head>
<body>
  <main aria-labelledby="brief-title">
    <header><div class="wordmark" aria-label="Solvin">solvin<span>.</span></div><div class="edition">Project brief<br>For discussion</div></header>
    <section class="intro">
      <span class="eyebrow">Your idea, taking shape</span>
      <h1 id="brief-title">A clear place<br><em>to begin.</em></h1>
      ${paragraph(service, "service")}
      ${paragraph(recommendation.workflowSummary, "summary")}
      ${context.length ? `<dl class="context">${context.map(item => `<div><dt>${escapeHtml(item.label)}</dt><dd>${paragraph(item.value)}</dd></div>`).join("")}</dl>` : ""}
    </section>
    <section class="release"><h2>A useful first release</h2>${paragraph(recommendation.firstProject)}</section>
    <div class="sections">
      <section><h2>What success looks like</h2>${paragraph(recommendation.opportunity)}${preview?.desiredOutcome ? `<div class="outcome"><span class="detail-label">Your desired outcome</span>${paragraph(preview.desiredOutcome)}</div>` : ""}${preview?.successMetric ? `<div class="metric"><span class="detail-label">Your measure of success</span>${paragraph(preview.successMetric)}</div>` : ""}</section>
      <section><h2>Decisions to confirm</h2>${paragraph(recommendation.blocker)}${preview?.constraints ? `<div class="constraint"><span class="detail-label">Constraint you shared</span>${paragraph(preview.constraints)}</div>` : ""}</section>
    </div>
    <section class="support"><h2>How Solvin helps</h2>${paragraph(recommendation.recommendedService)}${preview?.tools?.length ? `<div class="tools"><span class="detail-label">Tools to consider</span>${paragraph(preview.tools.join(" · "))}</div>` : ""}</section>
    <section class="next"><span class="arrow" aria-hidden="true">↗</span><div><h2>The next step</h2>${paragraph(recommendation.nextAction)}</div></section>
    <footer><p>A starting point for a conversation. This is a draft for discussion; scope, timing, cost, and any open decisions are still to be agreed together.</p><p class="footer-brand">SOLVIN</p></footer>
  </main>
  <p class="print-hint">Yours to keep. To save a PDF, open your browser’s print menu and choose “Save as PDF”.</p>
</body>
</html>`;
}
