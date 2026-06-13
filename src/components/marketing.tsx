import Link from "next/link";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { faqs, painPoints, processSteps, services, trustPillars } from "@/lib/content";

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2 className="title">{title}</h2>{text && <p className="subtitle">{text}</p>}</div>;
}

export function WorkflowVisual() {
  const steps = ["Manual work", "Workflow design", "AI assistance", "Human approval", "Useful output"];
  return (
    <div className="workflow-visual surface" aria-label="Workflow from manual work to approved output">
      <div className="visual-top"><span className="eyebrow">A practical system</span><span className="review-label">Human review built in</span></div>
      <div className="workflow-list">
        <span className="workflow-progress" aria-hidden="true" />
        {steps.map((step, index) => (
          <div className="workflow-node" style={{ "--step": index } as React.CSSProperties} key={step}>
            <span className="workflow-marker" aria-hidden="true" />
            <span className="workflow-number">{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PainGrid() {
  return <div className="pain-grid">{painPoints.map(({ title, icon: Icon, text }) => <article className="card" key={title}><Icon className="card-icon" /><h3>{title}</h3><p>{text}</p></article>)}</div>;
}

export function ServiceGrid({ detailed = false }: { detailed?: boolean }) {
  return <div className="service-grid">{services.map(({ title, icon: Icon, description, bestFor, deliverables }, i) => <article className="card service-card" key={title}><div className="service-top"><span className="service-index">0{i + 1}</span><Icon className="card-icon" /></div><h3>{title}</h3><p>{description}</p>{detailed && <><p className="best-for"><strong>Best for:</strong> {bestFor}</p><ul>{deliverables.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul></>}<Link href={i === 0 ? "/readiness" : "/contact"}>{i === 0 ? "Start the check" : "Discuss this service"} <ArrowRight size={16} /></Link></article>)}</div>;
}

export function Process() {
  return <div className="process-list">{processSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>;
}

export function TrustGrid() {
  return <div className="cards">{trustPillars.map(({ title, icon: Icon, text }) => <article className="card" key={title}><Icon className="card-icon" /><h3>{title}</h3><p>{text}</p></article>)}</div>;
}

export function Faqs() {
  return <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown /></summary><p>{answer}</p></details>)}</div>;
}

export function FinalCta() {
  return <section className="section"><div className="container cta-panel"><p className="eyebrow">A useful first step</p><h2 className="title">Find the first workflow worth automating.</h2><p>Start with a short guided conversation. Get a practical recommendation before deciding what to build.</p><div className="button-row"><Link className="btn btn-primary" href="/readiness">Start the readiness check <ArrowRight size={17} /></Link><Link className="btn btn-secondary" href="/contact">Book a discovery call</Link></div></div></section>;
}
