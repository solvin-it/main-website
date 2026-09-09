import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CinematicAssistantHero } from "@/components/cinematic-assistant-hero";

export default function Home() {
  return <>
    <section className="systems-hero cinematic-sequence">
      <div className="cinematic-hero">
        <CinematicAssistantHero />
      </div>
    </section>

    <section className="section section-charcoal"><div className="container build-map"><div><h2 className="title">What Solvin builds</h2><p className="subtitle">We design the experience and engineer what sits behind it—so the result is useful, dependable, and ready for real work.</p></div><div className="build-list"><article><h3>Web applications</h3><p>Customer portals, business platforms, dashboards, and custom tools that work securely in the browser.</p></article><article><h3>Business websites</h3><p>Clear, high-conviction websites that explain the offer, establish credibility, generate leads, and support sales.</p></article><article><h3>AI-powered applications</h3><p>Assistants, knowledge tools, and intelligent features that understand context while keeping important decisions controlled.</p></article><article><h3>Mobile and desktop apps</h3><p>Cross-platform applications for work and customer experiences that need to live beyond the browser.</p></article></div></div></section>

    <section className="section" id="method"><div className="container method-section"><h2 className="title">Understand first.<br />Build what matters.</h2><div className="method-line"><article><span>Observe</span><p>Start with the people, decisions, tools, exceptions, and desired result.</p></article><article><span>Shape</span><p>Define the smallest useful product and the system it needs.</p></article><article><span>Build</span><p>Design and engineer the interface, intelligence, and controls together.</p></article><article><span>Validate</span><p>Test with realistic inputs, failure cases, and accountable review.</p></article></div></div></section>

    <section className="section founder-section"><div className="container founder-grid"><div className="founder-mark"><Image src="/solvin-mark-reverse.svg" alt="" width={190} height={190} /></div><div><h2>Direct judgment.<br />Clear accountability.</h2><p>Solvin is led by Jose Fernando Gonzales. You work directly with the person shaping the product and building the system, with collaborators brought in when the work calls for them.</p><Link className="text-link" href="/about">About Jose and Solvin <ArrowRight size={16} /></Link></div></div></section>

    <section className="section conversation-section"><div className="container conversation-grid"><h2>Tell me what feels harder than it should.</h2><div><p>You do not need a technical brief. Start with the part of running your business that is repetitive, unclear, slow, or easy to miss.</p><Link className="btn btn-gold" href="/readiness?new=1#assistant-workspace">Start a guided conversation <ArrowRight size={17} /></Link></div></div></section>
  </>;
}
