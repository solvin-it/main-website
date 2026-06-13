import type { Metadata } from "next";
import { FinalCta, SectionHeading, ServiceGrid } from "@/components/marketing";

export const metadata: Metadata = { title: "AI Workflow Automation Services", description: "Workflow audits, AI prototypes, automation implementation, and knowledge assistant development." };

export default function ServicesPage() {
  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow">Services</p><h1 className="display">From workflow clarity to working automation.</h1><p className="subtitle">Choose the right level of support for your current stage. Solvin starts with the business process and uses AI only where it creates practical value.</p></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Core offers" title="A focused path for every level of readiness." /><ServiceGrid detailed /></div></section>
    <section className="section" style={{ background: "var(--surface-2)" }}><div className="container split"><div><p className="eyebrow">Implementation principles</p><h2 className="title">The smallest useful system comes first.</h2></div><div className="prose"><p>Not every workflow needs an agent. Some need a clearer process, a reliable integration, or an AI-assisted draft with human review.</p><p>Recommendations account for business impact, data readiness, exceptions, operational ownership, and risk before technology selection.</p></div></div></section>
    <FinalCta />
  </>;
}
