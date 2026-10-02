import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Asterisk, Check, Code2, Sparkles } from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { ReadinessChat } from "@/components/readiness-chat";
import { CapabilityPlayground } from "@/components/capability-playground";
import { StudioMotion } from "@/components/studio-motion";
import { AssistantLink } from "@/components/assistant-link";

const steps = [
  ["01", "Find the real opportunity.", "We get to know your business, your people, and what a better experience would mean."],
  ["02", "Make it tangible.", "A clear direction. A considered design. Working software you can see, use, and help shape."],
  ["03", "Build for the real world.", "We test the details, connect the right tools, and prepare your team to make it their own."],
];

export default function Home() {
  return <>
    <StudioMotion />
    <section className="spectacle-hero" aria-labelledby="hero-heading">
      <div className="spectacle-atmosphere" aria-hidden="true"><div /><div /></div>
      <div className="container spectacle-layout">
        <div className="spectacle-copy">
          <p className="spectacle-eyebrow"><span /> Independent digital studio · Manila &amp; everywhere</p>
          <h1 id="hero-heading">Beautiful websites.<br /><em>Brilliant agents.</em></h1>
          <p className="spectacle-description">An unforgettable presence. A smarter way to work.<br className="desktop-break" /> We bring thoughtful design and intelligent engineering together.</p>
          <div className="spectacle-actions"><a href="#experience">Experience what we do <ArrowDown size={16} /></a><Link href="/contact">Have a project in mind? <ArrowUpRight size={16} /></Link></div>
          <div className="spectacle-sculpture"><div className="spectacle-halo" aria-hidden="true"><i /><i /><i /></div><HeroScene /></div>
        </div>
        <div className="spectacle-assistant">
          <div className="assistant-workspace" id="assistant-workspace" tabIndex={-1}><ReadinessChat surface="studio" /></div>
          <p className="spectacle-assistant-note"><Sparkles size={14} /> A real conversation. A useful starting brief. Yours to keep.</p>
        </div>
      </div>
      <div className="container spectacle-baseline"><span>Design that draws you in. Intelligence that moves you forward.</span><a href="#experience" aria-label="Explore the website"><ArrowDown size={16} /></a></div>
    </section>

    <div className="studio-ribbon" aria-label="Our disciplines"><div><span>Websites with presence</span><Asterisk aria-hidden="true" /><span>Agents with purpose</span><Asterisk aria-hidden="true" /><span>Experiences worth remembering</span><Asterisk aria-hidden="true" /></div></div>

    <section className="section experience-section" id="experience" aria-labelledby="experience-heading">
      <div className="container" data-reveal>
        <div className="experience-heading"><div><p className="eyebrow">Go ahead. Get a feel for it.</p><h2 id="experience-heading">The experience<br />is the <em>proof.</em></h2></div><p>This website is a little of what we do.<br />Explore the design. Try the intelligence.<br />Imagine what we could make for you.</p></div>
        <CapabilityPlayground />
      </div>
    </section>

    <section className="section build-section" id="capabilities" aria-labelledby="build-heading"><div className="container" data-reveal>
      <div className="experience-heading"><div><p className="eyebrow">Two disciplines. One complete experience.</p><h2 id="build-heading">Make an impression.<br /><em>Make a difference.</em></h2></div><Link className="text-link" href="/capabilities">Explore our capabilities <ArrowUpRight size={18} /></Link></div>
      <div className="build-grid">
        <article className="build-card build-web"><div className="build-card-top"><Code2 size={25} strokeWidth={1.4} /><span>01 / The experience</span></div><h3>A website that<br />feels like <em>you.</em></h3><p>Distinctive websites and applications that turn your story into something people want to explore. Every interaction, every screen, every detail considered.</p><ul><li><Check size={15} /> Brand websites &amp; interactive experiences</li><li><Check size={15} /> Web applications &amp; customer portals</li><li><Check size={15} /> Responsive design &amp; thoughtful motion</li></ul><AssistantLink prompt="I want a distinctive website for my business. Help me shape the experience and first release.">Let’s shape your website <ArrowUpRight size={19} /></AssistantLink><div className="web-card-art" aria-hidden="true"><span /><span /><span /></div></article>
        <article className="build-card build-agents"><div className="build-card-top"><Sparkles size={25} strokeWidth={1.4} /><span>02 / The intelligence</span></div><h3>An agent that<br />gets the <em>work.</em></h3><p>Assistants that understand your context, connect to your tools, and help your people do more. Useful intelligence, built around the way your business actually works.</p><ul><li><Check size={15} /> AI assistants &amp; knowledge systems</li><li><Check size={15} /> Connected tools &amp; agent workflows</li><li><Check size={15} /> Clear boundaries &amp; human review</li></ul><AssistantLink prompt="I want an AI agent for my business. Help me find a useful first project.">Find your agent’s purpose <ArrowUpRight size={19} /></AssistantLink><div className="agent-card-art" aria-hidden="true"><i /><i /><i /><span /></div></article>
      </div>
    </div></section>

    <section className="section studio-method" id="method" aria-labelledby="method-heading"><div className="container" data-reveal><div className="experience-heading"><div><p className="eyebrow">From a first conversation to a considered launch</p><h2 id="method-heading">Ambition, meet<br /><em>attention to detail.</em></h2></div><p>You bring the idea.<br />We bring the perspective, craft,<br />and engineering to make it work.</p></div><div className="studio-method-grid">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="studio-founder" aria-labelledby="founder-heading"><div className="container" data-reveal><div className="founder-monogram"><Image src="/solvin-mark.svg" alt="" width={120} height={120} /><span>A personal perspective.<br />An uncompromising standard.</span></div><div><p className="eyebrow">The person behind Solvin</p><h2 id="founder-heading">Good work starts<br />with a <em>good conversation.</em></h2><p>I’m Jose. I bring business understanding, design, and hands-on engineering together. You work directly with the person thinking through your problem and building the solution.</p><div className="founder-links"><Link className="btn btn-primary" href="/contact">Talk to Jose <ArrowUpRight size={18} /></Link><Link className="text-link" href="/about">Meet the founder <ArrowRight size={16} /></Link></div></div></div></section>
  </>;
}
