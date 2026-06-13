import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Faqs, FinalCta, PainGrid, Process, SectionHeading, ServiceGrid, TrustGrid, WorkflowVisual } from "@/components/marketing";

export default function Home() {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">AI workflow consulting & implementation</p>
          <h1 className="display">Build AI workflows that make your business easier to run.</h1>
          <p className="subtitle">Solvin Solutions helps businesses identify, design, and implement practical AI automation, from internal assistants and knowledge systems to reporting and operational support.</p>
          <div className="button-row"><Link className="btn btn-primary" href="/readiness">Start the readiness check <ArrowRight size={17} /></Link><Link className="btn btn-secondary" href="/services">View services</Link></div>
          <p className="trust-line">Practical automation. Clear workflows. Responsible implementation.</p>
        </div>
        <WorkflowVisual />
      </div>
    </section>

    <section className="section"><div className="container"><SectionHeading eyebrow="The real problem" title="AI is useful only when the workflow is clear." text="Many businesses do not have an AI problem. They have work scattered across email, spreadsheets, chat, documents, and disconnected tools." /><PainGrid /></div></section>

    <section className="section" style={{ background: "var(--surface-2)" }}><div className="container"><SectionHeading eyebrow="Services" title="Automation built around practical business workflows." text="Start with clarity, validate the opportunity, then implement the smallest system that creates useful operational value." /><ServiceGrid /></div></section>

    <section className="section"><div className="container readiness-preview"><div><p className="eyebrow">AI Workflow Readiness Check</p><h2 className="title">Not sure where AI fits? Start with a guided conversation.</h2><p className="subtitle">A short consultative assessment of your workflow, tools, data, and approval needs. It produces a practical recommendation, not a generic score.</p><div className="button-row"><Link className="btn btn-primary" href="/readiness">Start the check <ArrowRight size={17} /></Link></div><p className="muted readiness-timing">Usually takes 5–8 minutes.</p></div><div className="chat-preview surface"><div className="chat-preview-header"><span className="avatar"><Bot size={18} /></span>Solvin Advisor</div><div className="bubble">What is one recurring task that takes more time than it should?</div><div className="bubble user">Our team compiles a weekly report from spreadsheets and email updates.</div><div className="bubble"><CheckCircle2 size={16} /> That sounds recurring and structured enough to explore. Does someone review the report before it is shared?</div></div></div></section>

    <section className="section" style={{ background: "var(--surface)" }}><div className="container"><SectionHeading eyebrow="Our process" title="A clear path from idea to working automation." /><Process /></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Built with context" title="Responsible systems, not AI hype." text="Useful automation should fit the business, keep people in control, and remain understandable after handover." /><TrustGrid /></div></section>

    <section className="section" style={{ background: "var(--surface-2)" }}><div className="container split"><div><p className="eyebrow">About Solvin</p><h2 className="title">Led by a systems-minded AI automation consultant.</h2></div><div><p className="subtitle">Solvin Solutions combines business analysis, technical solutioning, API integration, cloud systems, process improvement, and applied AI. The approach is simple: understand the work, design the system, build carefully, and improve from real use.</p><Link className="btn btn-secondary" href="/about">Read about the founder <ArrowRight size={17} /></Link></div></div></section>
    <section className="section"><div className="container split"><SectionHeading eyebrow="Common questions" title="A practical approach starts with clear answers." /><Faqs /></div></section>
    <FinalCta />
  </>;
}
