import Link from "next/link";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
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

export function AssistantInterface({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`product-interface assistant-preview${compact ? " product-interface-compact" : ""}`} aria-label="The Assistant preparing a project brief from a conversation">
      <div className="product-bar"><span>The Assistant</span><span>Conversation → Project brief</span></div>
      <div className="assistant-preview-body">
        <div className="preview-conversation">
          <div className="preview-message assistant-message"><span>Assistant</span><p>What part of running the business feels harder than it should?</p></div>
          <div className="preview-message visitor-message"><span>You</span><p>Customer requests arrive in different places and some get missed.</p></div>
          <div className="preview-message assistant-message preview-follow-up"><span>Assistant</span><p>Where do they usually arrive—email, chat, forms, or calls?</p></div>
          <form className="preview-composer" action="/readiness#assistant-workspace">
            <label className="sr-only" htmlFor={compact ? "hero-prompt" : "work-prompt"}>Describe what feels harder than it should</label>
            <input id={compact ? "hero-prompt" : "work-prompt"} name="prompt" placeholder="Describe the problem in plain language…" />
            <input type="hidden" name="new" value="1" />
            <button aria-label="Start a conversation"><Send size={16} /></button>
          </form>
        </div>
        <div className="preview-brief">
          <div className="brief-heading"><span>Project brief</span><strong>Customer request workflow</strong></div>
          <dl>
            <div><dt>Current situation</dt><dd>Requests arrive across several channels.</dd></div>
            <div><dt>Problem</dt><dd>Ownership and follow-up are easy to miss.</dd></div>
            <div><dt>Useful first step</dt><dd>One intake and triage flow with clear accountability.</dd></div>
          </dl>
          <span className="brief-status">Drafting as you talk</span>
        </div>
      </div>
    </div>
  );
}

export const ProductInterface = AssistantInterface;

export function FeaturedWork({ detailed = false }: { detailed?: boolean }) {
  return (
    <article className={`featured-project${detailed ? " featured-project-detailed" : ""}`}>
      <div className="project-copy">
        <p className="eyebrow">Working product / The Assistant</p>
        <h2>A guided conversation that turns operational context into a project brief.</h2>
        <p>The Assistant combines focused questions, structured model extraction, deterministic workflow logic, session recovery, and consent-aware lead capture.</p>
        <div className="project-facts"><span>Product strategy</span><span>UX &amp; interface</span><span>Full-stack engineering</span><span>AI orchestration</span></div>
        {detailed && <p className="project-outcome"><strong>Current outcome</strong> A functioning internal product and qualification tool prepared for production configuration. No client-performance claims are made.</p>}
        <Link className="text-link" href="/work">View the system <ArrowRight size={16} /></Link>
      </div>
      <AssistantInterface />
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
        <div className="button-row"><Link className="btn btn-blue" href="/contact">Start a project <ArrowRight size={17} /></Link><Link className="btn btn-secondary" href="/readiness?new=1#assistant-workspace">Try the Assistant</Link></div>
      </div>
    </section>
  );
}
