import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "About Jose", description: "Meet Jose Fernando Gonzales, the founder of Solvin. Business understanding, thoughtful design, and hands-on engineering." };

export default function AboutPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">Independent by design</p><h1 className="display">A person.<br />A perspective.<br /><span className="muted">A commitment to craft.</span></h1></div><div className="page-hero-aside"><p className="subtitle">Solvin is the studio of Jose Fernando Gonzales. Thoughtful digital experiences and useful software, built with a direct line to the person doing the work.</p></div></div></section>
    <section className="section"><div className="container studio-story"><div className="about-manifesto"><span>The Solvin perspective</span><blockquote>Understand<br />the work.<br />Care about<br />the details.</blockquote><div><Image src="/solvin-mark.svg" alt="" width={48} height={48} /><span>Jose Fernando Gonzales<small>Founder, Solvin · Manila</small></span></div></div><div className="prose"><p className="eyebrow">A little context</p><h2 className="title">Business understanding.<br />Builder’s instinct.</h2><p>I’m Jose. My background spans business analysis, FinTech systems, API integration, workflow design, cloud-native platforms, and applied AI.</p><p>That combination shapes how I work. I want to understand the person using the product, the decisions behind the interface, and the system that makes it all dependable.</p><p>Solvin brings that thinking together. From a distinctive website to a connected business application, I shape the direction and build the details. When a project calls for additional expertise, I bring in collaborators.</p><p>The relationship stays direct. You know who is thinking about your problem, why decisions are being made, and what is being built.</p><Link className="text-link" href="/contact">Let’s start a conversation <ArrowUpRight size={17} /></Link><div className="about-details"><div><span>Based in</span>Manila, Philippines</div><div><span>Working with</span>Founders and business teams</div></div></div></div></section>
    <section className="section section-tone"><div className="container"><div className="editorial-heading"><div><p className="eyebrow">Principles in practice</p><h2>The details reveal<br />the thinking.</h2></div></div><div className="principle-list">{[
      ["01", "Listen before building.", "The most useful insight often comes from understanding how someone actually gets through their day."],
      ["02", "Make the complex feel clear.", "Good interfaces make the next step understandable. Good systems make that step dependable."],
      ["03", "Own the whole experience.", "Design, engineering, failure handling, accessibility, and handover all deserve the same care."],
      ["04", "Let the work speak.", "Show what exists, explain the decisions, and make claims only when there is evidence to support them."],
    ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
  </>;
}
