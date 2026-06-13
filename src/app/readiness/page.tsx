import type { Metadata } from "next";
import { ReadinessChat } from "@/components/readiness-chat";

export const metadata: Metadata = { title: "AI Workflow Readiness Check", description: "Assess your workflow, data, tools, and risk to find a practical first automation project." };

export default function ReadinessPage() {
  return <><section className="page-hero"><div className="container"><p className="eyebrow">AI Workflow Readiness Check</p><h1 className="display">Find where AI automation may actually help.</h1><p className="subtitle">Describe one recurring workflow. Solvin Advisor will assess its clarity, repetition, data readiness, impact, and approval needs, then recommend a practical next step.</p></div></section><section className="section" style={{ background: "var(--surface-2)" }}><div className="container"><ReadinessChat /></div></section></>;
}
