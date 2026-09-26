import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Asterisk } from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { ReadinessChat } from "@/components/readiness-chat";
import { WorkflowExplorer } from "@/components/workflow-explorer";

const capabilities = [
  { number: "01", title: "Websites with presence.", description: "A considered first impression. A clear story. A website that makes your next conversation easier.", tags: "Brand websites / Portfolios / Digital experiences" },
  { number: "02", title: "Products with purpose.", description: "Web, mobile, and desktop applications shaped around the people who actually use them.", tags: "Web applications / Customer portals / Cross-platform" },
  { number: "03", title: "Intelligence that helps.", description: "Useful assistants, connected knowledge, and workflows that give your team room to do better work.", tags: "AI assistants / Knowledge systems / Automation" },
];

export default function Home() {
  return <>
    <section className="perspective-hero" aria-labelledby="hero-heading">
      <div className="container hero-layout">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span /> Independent thinking. Thoughtful engineering.</p>
          <h1 id="hero-heading">Complex work.<br /><span className="hero-outline">Beautifully</span><br />solved<span className="blue-period">.</span></h1>
          <p className="hero-description">Websites, applications, and intelligent systems.<br className="desktop-break" /> Made to look exceptional. Built to work beautifully.</p>
          <div className="hero-actions"><Link className="btn btn-primary" href="#assistant-workspace">Talk to the Assistant <ArrowUpRight size={18} /></Link><Link className="hero-conversation" href="/contact">Talk to Jose <ArrowUpRight size={17} /></Link></div>
        </div>
        <HeroScene />
      </div>
      <div className="container hero-baseline"><a href="#assistant-workspace"><ArrowDown size={15} /> Try Solvin for yourself</a><span>Based in Manila. Building beyond borders.</span></div>
    </section>

    <div className="discipline-strip"><div className="container"><span>Strategy meets craft.</span><p>Digital experiences <Asterisk size={18} /> Useful software <Asterisk size={18} /> Applied intelligence</p></div></div>

    <section className="section homepage-assistant" aria-labelledby="assistant-heading">
      <div className="container">
        <div className="editorial-heading"><div><p className="eyebrow">01 / Put Solvin to work</p><h2 id="assistant-heading">Your idea.<br /><span className="muted">Let’s work through it.</span></h2></div><p className="section-aside">This is a working conversation.<br />Bring a problem. Leave with a clearer starting point.</p></div>
        <div className="assistant-workspace assistant-page" id="assistant-workspace"><ReadinessChat /></div>
        <p className="assistant-bottom-note">A few thoughtful questions. A useful project brief.<br />Prefer a direct conversation? <Link href="/contact">Write to Jose.</Link></p>
      </div>
    </section>

    <section className="section clarity-section" id="possibilities"><div className="container"><div className="editorial-heading"><div><p className="eyebrow">02 / From friction to flow</p><h2>Good software starts<br />with a real problem.</h2></div><p className="section-aside">Choose something familiar.<br />See what a clearer way could look like.</p></div><WorkflowExplorer /></div></section>

    <section className="section craft-section"><div className="container"><div className="editorial-heading"><div><p className="eyebrow">03 / What we build</p><h2>Considered on the surface.<br /><span>Capable underneath.</span></h2></div><p className="section-aside">The experience and the engineering,<br />thought through together.</p></div><div className="craft-list">{capabilities.map(item => <Link href="/capabilities" key={item.number}><span className="craft-index">{item.number}</span><div><h3>{item.title}</h3><p>{item.description}</p><span className="craft-tags">{item.tags}</span></div><ArrowUpRight size={27} strokeWidth={1.3} /></Link>)}</div></div></section>

    <section className="section method-revamp" id="method"><div className="container"><div className="editorial-heading"><div><p className="eyebrow">04 / The approach</p><h2>Clarity first.<br />Then, the right build.</h2></div><p className="section-aside">Close collaboration. Clear decisions.<br />Care in the details that matter.</p></div><div className="method-steps">{[
      ["01", "Understand", "The people. The friction. The ambition. We start with the work, before reaching for the tools."],
      ["02", "Shape", "Make the important decisions tangible. A clear direction, a focused scope, a useful first version."],
      ["03", "Build", "Bring the experience and the system together, with working software you can see and try."],
      ["04", "Refine", "Test the real situations. Question the details. Launch thoughtfully, and improve with use."],
    ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="founder-revamp"><div className="container"><div className="founder-signature"><Image src="/solvin-mark.svg" alt="" width={110} height={110} /><span>Independent by design.</span></div><div><p className="eyebrow">The person behind the perspective</p><h2>A direct line to<br />the person building it.</h2><p>I’m Jose, the founder of Solvin. I connect business understanding with hands-on design and engineering. You work directly with me, from the first question to the final detail.</p><Link className="text-link" href="/about">A little more about me <ArrowUpRight size={17} /></Link></div></div></section>
  </>;
}
