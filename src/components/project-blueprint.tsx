"use client";

import { ArrowDownToLine, ArrowUpRight, CircleCheck, Flag, Layers3, ScanLine, Target, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatProjectBriefDocument } from "@/lib/project-brief-document";
import type { ProjectPreview, Recommendation } from "@/lib/types";
import "./project-blueprint.css";

type ProjectBlueprintProps = {
  preview?: ProjectPreview;
  recommendation?: Recommendation;
  busy?: boolean;
};

type BlueprintDetail = {
  label: string;
  icon: LucideIcon;
  value?: string;
  placeholder: string;
};

function BlueprintIllustration() {
  return <div className="blueprint-illustration" aria-hidden="true">
    <div className="blueprint-illustration-glow" />
    <div className="blueprint-illustration-sheet blueprint-illustration-sheet-back" />
    <div className="blueprint-illustration-sheet blueprint-illustration-sheet-front">
      <svg viewBox="0 0 230 170" fill="none">
        <path className="blueprint-sketch-line" d="M28 34H119M28 44H83M28 89H111M28 103H94M28 117H107" />
        <path className="blueprint-sketch-frame" d="M27 66H127V137H27V66ZM143 66H204V137H143V66Z" />
        <path className="blueprint-sketch-orbit" d="M168 29C188 22 205 30 205 44C205 59 190 68 176 58C163 49 160 31 178 27" />
        <circle className="blueprint-sketch-node" cx="176" cy="43" r="6" />
        <path className="blueprint-sketch-connection" d="M128 101H145M174 73V127M154 100H195" />
        <circle className="blueprint-sketch-node" cx="174" cy="101" r="13" />
        <circle className="blueprint-sketch-point" cx="174" cy="101" r="3" />
      </svg>
    </div>
    <span className="blueprint-illustration-spark blueprint-illustration-spark-one" />
    <span className="blueprint-illustration-spark blueprint-illustration-spark-two" />
  </div>;
}

export function ProjectBlueprint({ preview, recommendation, busy = false }: ProjectBlueprintProps) {
  const details: BlueprintDetail[] = [
    { label: "The goal", icon: Flag, value: preview?.goal, placeholder: "What you want to make possible" },
    { label: "The people", icon: UsersRound, value: preview?.audience, placeholder: "Who we’re building this for" },
    { label: "The outcome", icon: Target, value: preview?.desiredOutcome, placeholder: "What a better day looks like" },
    { label: "The connections", icon: Layers3, value: preview?.tools?.join(" · "), placeholder: "The tools it needs to work with" },
    { label: "The boundaries", icon: ScanLine, value: preview?.constraints, placeholder: "The things we need to work around" },
  ];
  const capturedDetails = details.filter(detail => Boolean(detail.value));
  const hasDetails = capturedDetails.length > 0 || Boolean(preview?.service || preview?.successMetric);

  if (recommendation) {
    return <section className="blueprint blueprint-ready" aria-label="Your project blueprint">
      <div className="blueprint-ready-heading">
        <div><span className="blueprint-eyebrow">A direction worth exploring</span><h2>Your starting brief.</h2></div>
        <span className="blueprint-ready-seal" aria-hidden="true"><CircleCheck size={22} strokeWidth={1.5} /></span>
      </div>
      <article className="blueprint-document" aria-label="Your project brief">
        <div className="blueprint-document-masthead"><span>solvin<span className="blueprint-document-period">.</span></span><p>Starting brief · for review</p></div>
        {preview?.service && <span className="blueprint-document-service">{preview.service}</span>}
        <p className="blueprint-document-summary">{recommendation.workflowSummary}</p>
        <section className="blueprint-document-release"><span className="blueprint-document-section-label">A useful first release</span><h3>{recommendation.firstProject}</h3></section>
        <div className="blueprint-document-sections">
          <section><h3>What success looks like</h3><p>{recommendation.opportunity}</p>{preview?.successMetric && <p className="blueprint-document-measure"><Target size={14} aria-hidden="true" /><span>{preview.successMetric}</span></p>}</section>
          <section><h3>Decisions to confirm</h3><p>{recommendation.blocker}</p></section>
          <section><h3>How Solvin can help</h3><p>{recommendation.recommendedService}</p></section>
        </div>
        <section className="blueprint-document-next"><ArrowUpRight size={19} aria-hidden="true" /><div><h3>The next step</h3><p>{recommendation.nextAction}</p></div></section>
        <p className="blueprint-document-note">A starting point for a conversation. Scope, timing, and cost are still to be agreed.</p>
      </article>
      <a className="blueprint-download" href={`data:text/html;charset=utf-8,${encodeURIComponent(formatProjectBriefDocument(recommendation, preview))}`} download="solvin-project-brief.html" aria-label="Download your project brief"><ArrowDownToLine size={16} aria-hidden="true" /><span>Keep your brief</span></a>
      <p className="blueprint-download-note">Yours to keep. Open it to read, print, or save as a PDF.</p>
    </section>;
  }

  return <section className={`blueprint blueprint-working${hasDetails ? " blueprint-has-details" : " blueprint-empty"}${busy ? " blueprint-is-busy" : ""}`} aria-label="Your project blueprint">
    <header className="blueprint-header">
      <span className="blueprint-eyebrow">Made from our conversation</span>
      <h2>Your project,<br />taking shape.</h2>
      <p>A little clarity with every exchange. The important details find a home here.</p>
      {preview?.service && <span className="blueprint-service">{preview.service}</span>}
    </header>
    {!hasDetails && <div className="blueprint-empty-intro"><BlueprintIllustration /><h3>Your idea starts the story.</h3><p>Tell me what you have in mind. We’ll turn it into a thoughtful starting brief, together.</p></div>}
    <div className="blueprint-detail-list">
      {details.map(({ label, icon: Icon, value, placeholder }) => <div className={`blueprint-detail${value ? " blueprint-detail-filled" : ""}`} key={label}>
        <span className="blueprint-detail-icon" aria-hidden="true"><Icon size={16} strokeWidth={1.5} /></span>
        <div><h3>{label}</h3><p key={value || "empty"} className={value ? "blueprint-detail-value" : "blueprint-detail-placeholder"}>{value || placeholder}</p></div>
        {value && <CircleCheck className="blueprint-detail-check" size={14} aria-hidden="true" />}
      </div>)}
    </div>
    {preview?.successMetric && <div className="blueprint-success"><Target size={16} aria-hidden="true" /><div><span>You’ll know it’s working when…</span><p>{preview.successMetric}</p></div></div>}
    <footer className="blueprint-footer"><span className={`blueprint-footer-indicator${busy ? " blueprint-footer-indicator-active" : ""}`} aria-hidden="true" /><span>{busy ? "Thinking through your latest message…" : hasDetails ? "The direction grows as we talk." : "We’ll explore this together."}</span></footer>
    <span className="blueprint-announcement" role="status">{capturedDetails.length ? `${capturedDetails.length} project ${capturedDetails.length === 1 ? "detail" : "details"} captured from your conversation.` : ""}</span>
  </section>;
}
