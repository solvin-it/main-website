import type { Metadata } from "next";
import { Engagements, FinalCta, PracticeGrid, SectionHeading } from "@/components/marketing";

export const metadata: Metadata = { title: "What we build", description: "Web applications, AI-native products, websites, and cross-platform software designed around real work." };

export default function CapabilitiesPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="measure-label">What we build</p><h1 className="display">The right form for the work.</h1></div><div className="page-hero-aside"><p className="subtitle">Start with the business situation. Solvin then shapes the website, application, AI capability, or cross-platform product that makes it clearer and easier to handle.</p></div></div></section>
    <section className="section"><div className="container"><PracticeGrid detailed /></div></section>
    <section className="section section-tone"><div className="container"><SectionHeading eyebrow="Engagement models" title="Start at the level the problem requires." text="The engagement changes with the maturity of the idea, but the focus stays on shipping the smallest useful system with a clear path forward." /><Engagements /></div></section>
    <section className="section"><div className="container capability-groups">
      <article className="capability-group"><h2>Product and interface</h2><div className="capability-columns"><div><h3>Experience design</h3><p>Turn business and user context into a focused product structure and clear interaction model.</p><ul><li>Product framing and requirements</li><li>User journeys and interface systems</li><li>Responsive web and mobile design</li></ul></div><div><h3>Application engineering</h3><p>Build accessible, production-minded interfaces and the services that make them useful.</p><ul><li>Next.js and TypeScript applications</li><li>Mobile and cross-platform experiences</li><li>APIs, authentication, and data flows</li></ul></div></div></article>
      <article className="capability-group"><h2>Intelligence and business software</h2><div className="capability-columns"><div><h3>AI-powered applications</h3><p>Use models for the work they do well while keeping important control in application code.</p><ul><li>Assistants and intelligent features</li><li>Retrieval and knowledge tools</li><li>Structured extraction and generation</li></ul></div><div><h3>Custom internal software</h3><p>Replace disconnected tools and handoffs with one clear interface for the people doing the work.</p><ul><li>Workflow and approval tools</li><li>Dashboards and internal portals</li><li>Integrations, testing, and handover</li></ul></div></div></article>
    </div></section>
    <FinalCta />
  </>;
}
