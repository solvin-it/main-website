import type { Metadata } from "next";
import { Engagements, FinalCta, PracticeGrid, SectionHeading } from "@/components/marketing";

export const metadata: Metadata = { title: "Capabilities", description: "AI-native web and mobile products, agents, internal tools, workflow systems, and ongoing engineering." };

export default function CapabilitiesPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">Capabilities</p><h1 className="display">Products people use. Systems businesses can run.</h1></div><div className="page-hero-aside"><p className="subtitle">Solvin joins product design, software engineering, applied AI, and operational thinking so the experience and the underlying system work together.</p></div></div></section>
    <section className="section"><div className="container"><PracticeGrid detailed /></div></section>
    <section className="section section-tone"><div className="container"><SectionHeading eyebrow="Engagement models" title="Start at the level the problem requires." text="The engagement changes with the maturity of the idea, but the focus stays on shipping the smallest useful system with a clear path forward." /><Engagements /></div></section>
    <section className="section"><div className="container capability-groups">
      <article className="capability-group"><h2>Product and interface</h2><div className="capability-columns"><div><h3>Experience design</h3><p>Turn business and user context into a focused product structure and clear interaction model.</p><ul><li>Product framing and requirements</li><li>User journeys and interface systems</li><li>Responsive web and mobile design</li></ul></div><div><h3>Application engineering</h3><p>Build accessible, production-minded interfaces and the services that make them useful.</p><ul><li>Next.js and TypeScript applications</li><li>Mobile and cross-platform experiences</li><li>APIs, authentication, and data flows</li></ul></div></div></article>
      <article className="capability-group"><h2>Intelligence and operations</h2><div className="capability-columns"><div><h3>Applied AI</h3><p>Use models for the work they do well while keeping important control in application code.</p><ul><li>Agents and copilots</li><li>Retrieval and knowledge systems</li><li>Structured extraction and generation</li></ul></div><div><h3>Operational systems</h3><p>Connect interfaces, models, people, and existing tools with explicit ownership and failure handling.</p><ul><li>Workflow orchestration</li><li>Human review and approvals</li><li>Observability, testing, and handover</li></ul></div></div></article>
    </div></section>
    <FinalCta />
  </>;
}
