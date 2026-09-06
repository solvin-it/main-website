import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AssistantInterface } from "@/components/marketing";

export default function Home() {
  return <>
    <section className="systems-hero">
      <div className="container systems-hero-heading">
        <h1>From the way work happens<br />to the software that improves it.</h1>
        <div className="systems-hero-intro">
          <p>Founder-led product design and engineering for businesses that need clearer workflows, useful software, and practical AI.</p>
          <div className="button-row"><Link className="btn btn-gold" href="/readiness?new=1#assistant-workspace">Try the Assistant <ArrowRight size={17} /></Link><Link className="text-link" href="#demonstration">See how it works</Link></div>
        </div>
      </div>
      <div className="systems-scroll" aria-label="A business workflow becoming a software system">
        <div className="systems-sticky">
          <div className="systems-art"><Image src="/portfolio-section.webp" alt="People working across conversations, documents, approvals, and business systems" fill priority sizes="100vw" /><div className="scene-caption"><strong>The work today</strong><span>Requests, decisions, and documents spread across people and tools.</span></div></div>
          <div className="systems-product"><AssistantInterface compact /></div>
          <div className="systems-signal" aria-hidden="true" />
          <div className="systems-steps" aria-hidden="true"><span>Describe</span><span>Clarify</span><span>Structure</span><span>Review</span></div>
        </div>
      </div>
      <a className="scroll-cue" href="#demonstration">See the system work <ArrowDown size={15} /></a>
    </section>

    <section className="section assistant-demonstration" id="demonstration"><div className="container demonstration-grid">
      <div className="demonstration-copy"><h2 className="title">Leave with more than a conversation.</h2><p className="subtitle">The Assistant helps you explain an operational problem without writing a technical brief. As the conversation develops, it turns what you say into a clear document both sides can review.</p><div className="demonstration-flow" aria-label="How the Assistant works"><span>Plain-language problem</span><ArrowRight size={18} /><span>Focused questions</span><ArrowRight size={18} /><span>Reviewable brief</span></div><Link className="btn btn-primary" href="/readiness?new=1#assistant-workspace">Start with your problem <ArrowRight size={17} /></Link></div>
      <div className="brief-specimen"><div className="brief-specimen-head"><span>Project brief</span><span>Draft for review</span></div><h3>Customer request workflow</h3><p>Prepared from a guided conversation—not a technical questionnaire.</p><dl><div><dt>What is happening</dt><dd>Requests arrive through email, chat, forms, and calls.</dd></div><div><dt>What is getting in the way</dt><dd>There is no consistent owner or follow-up view.</dd></div><div><dt>What a useful first version does</dt><dd>Captures every request, assigns responsibility, and makes status visible.</dd></div><div><dt>Next decision</dt><dd>Confirm the channels, owners, and handoff rules that belong in scope.</dd></div></dl><div className="brief-actions"><span>Review and correct</span><span>Email a copy</span><span>Send to Solvin</span></div></div>
    </div></section>

    <section className="section section-charcoal"><div className="container build-map"><div><h2 className="title">What Solvin builds</h2><p className="subtitle">We design the experience and engineer what sits behind it—so the result is useful, dependable, and ready for real work.</p></div><div className="build-list"><article><h3>Web applications</h3><p>Customer portals, business platforms, dashboards, and custom tools that work securely in the browser.</p></article><article><h3>Business websites</h3><p>Clear, high-conviction websites that explain the offer, establish credibility, generate leads, and support sales.</p></article><article><h3>AI-powered applications</h3><p>Assistants, knowledge tools, and intelligent features that understand context while keeping important decisions controlled.</p></article><article><h3>Mobile and desktop apps</h3><p>Cross-platform applications for work and customer experiences that need to live beyond the browser.</p></article></div></div></section>

    <section className="section" id="method"><div className="container method-section"><h2 className="title">Understand first.<br />Build what matters.</h2><div className="method-line"><article><span>Observe</span><p>Start with the people, decisions, tools, exceptions, and desired result.</p></article><article><span>Shape</span><p>Define the smallest useful product and the system it needs.</p></article><article><span>Build</span><p>Design and engineer the interface, intelligence, and controls together.</p></article><article><span>Validate</span><p>Test with realistic inputs, failure cases, and accountable review.</p></article></div></div></section>

    <section className="section founder-section"><div className="container founder-grid"><div className="founder-mark"><Image src="/solvin-mark-reverse.svg" alt="" width={190} height={190} /></div><div><h2>Direct judgment.<br />Clear accountability.</h2><p>Solvin is led by Jose Fernando Gonzales. You work directly with the person shaping the product and building the system, with collaborators brought in when the work calls for them.</p><Link className="text-link" href="/about">About Jose and Solvin <ArrowRight size={16} /></Link></div></div></section>

    <section className="section conversation-section"><div className="container conversation-grid"><h2>Tell me what feels harder than it should.</h2><div><p>You do not need a technical brief. Start with the part of running your business that is repetitive, unclear, slow, or easy to miss.</p><Link className="btn btn-gold" href="/readiness?new=1#assistant-workspace">Start a guided conversation <ArrowRight size={17} /></Link></div></div></section>
  </>;
}
