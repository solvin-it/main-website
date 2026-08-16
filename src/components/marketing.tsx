import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { approachSteps, engagements, faqs, practices } from "@/lib/content";

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <div className="section-heading-copy"><h2 className="title">{title}</h2>{text && <p className="subtitle">{text}</p>}</div>
    </div>
  );
}

export function CapabilityStrip() {
  return <div className="capability-strip" aria-label="Core capabilities"><span>Web products</span><span>Mobile applications</span><span>Agents &amp; copilots</span><span>Workflow systems</span></div>;
}

export function ProductInterface({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`product-interface${compact ? " product-interface-compact" : ""}`} aria-label="Readiness Advisor product interface preview">
      <div className="product-bar"><span>Solvin Advisor</span><span>Assessment / Summary</span></div>
      <div className="product-body">
        <aside><span className="active" /><span /><span /><span /></aside>
        <div className="product-content">
          <div className="product-heading"><span>AI workflow readiness</span><strong>Structured opportunity</strong></div>
          <div className="product-score"><strong>74</strong><span>/ 100</span></div>
          <div className="product-chart"><i /><i /><i /><i /><i /></div>
          <div className="product-rows"><span /><span /><span /></div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedWork({ detailed = false }: { detailed?: boolean }) {
  return (
    <article className={`featured-project${detailed ? " featured-project-detailed" : ""}`}>
      <div className="project-copy">
        <p className="eyebrow">Internal product / Readiness Advisor</p>
        <h2>A guided assessment that turns operational context into a build recommendation.</h2>
        <p>The advisor combines a controlled assessment flow, structured Claude extraction, deterministic scoring, session recovery, and consent-aware lead capture.</p>
        <div className="project-facts"><span>Product strategy</span><span>UX &amp; interface</span><span>Full-stack engineering</span><span>AI orchestration</span></div>
        {detailed && <p className="project-outcome"><strong>Current outcome</strong> A functioning internal product and qualification tool prepared for production configuration. No client-performance claims are made.</p>}
        <Link className="text-link" href="/work">View the system <ArrowRight size={16} /></Link>
      </div>
      <ProductInterface />
    </article>
  );
}

export function PracticeGrid({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="practice-grid">
      {practices.map(practice => <article className="practice" key={practice.number}>
        <div className="practice-index"><span>{practice.number}</span><span>{practice.label}</span></div>
        <h3>{practice.title}</h3>
        <p>{practice.description}</p>
        {detailed && <ul>{practice.items.map(item => <li key={item}>{item}</li>)}</ul>}
      </article>)}
    </div>
  );
}

export function Approach() {
  return (
    <div className="approach-list">
      {approachSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
    </div>
  );
}

export function Engagements() {
  return (
    <div className="engagement-list">
      {engagements.map(engagement => <article key={engagement.number}><span className="engagement-number">{engagement.number}</span><div><h3>{engagement.title}</h3><p>{engagement.text}</p></div><span className="engagement-duration">{engagement.duration}</span></article>)}
    </div>
  );
}

export function Faqs() {
  return <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>;
}

export function FinalCta() {
  return (
    <section className="section section-dark">
      <div className="container final-cta">
        <p className="eyebrow">Start with the problem</p>
        <h2>Bring the idea or the operational friction. We’ll shape what is worth building.</h2>
        <div className="button-row"><Link className="btn btn-blue" href="/contact">Start a project <ArrowRight size={17} /></Link><Link className="btn btn-secondary" href="/readiness">Try the Readiness Advisor</Link></div>
      </div>
    </section>
  );
}
