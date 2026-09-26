import type { Metadata } from "next";
import { AppWindow, BrainCircuit, Globe2, Smartphone } from "lucide-react";
import { Engagements, Faqs, FinalCta } from "@/components/marketing";

export const metadata: Metadata = { title: "Capabilities", description: "Thoughtful websites, web and mobile applications, and intelligent systems. Designed and engineered by Solvin." };

const offerings = [
  { icon: Globe2, title: "A website worth remembering.", text: "For businesses ready for a stronger first impression. We turn your positioning into a distinctive, accessible digital experience with a clear path to getting in touch.", tags: ["Brand websites", "Portfolios", "Interactive experiences"] },
  { icon: AppWindow, title: "Software that fits the work.", text: "For teams working around the limitations of disconnected tools. Custom portals, dashboards, and applications bring the right information and actions together.", tags: ["Web applications", "Customer portals", "Internal tools"] },
  { icon: BrainCircuit, title: "Intelligence with a purpose.", text: "For work that needs better answers, less repetition, or clearer decisions. We build assistants and connected workflows with useful context and human oversight.", tags: ["AI assistants", "Knowledge retrieval", "Workflow automation"] },
  { icon: Smartphone, title: "A product that goes with you.", text: "For experiences that need to live beyond a browser tab. Mobile and desktop applications designed around the devices, environments, and people using them.", tags: ["Mobile applications", "Cross-platform", "Desktop tools"] },
];

export default function CapabilitiesPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">What we build</p><h1 className="display">The right tools.<br /><span className="muted">A better way forward.</span></h1></div><div className="page-hero-aside"><p className="subtitle">Start with what your business needs to do better. We’ll shape the experience and engineer the system that makes it possible.</p></div></div></section>
    <section className="section"><div className="container"><p className="eyebrow">From first impression to everyday operation</p><div className="capability-offerings">{offerings.map(item => <article key={item.title}><item.icon size={33} strokeWidth={1.3} /><h2>{item.title}</h2><p>{item.text}</p><ul>{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></article>)}</div></div></section>
    <section className="section section-tone"><div className="container"><div className="editorial-heading"><div><p className="eyebrow">Ways to work together</p><h2>Start where you are.</h2></div><p className="section-aside">An early idea, a focused build,<br />or a product ready for its next chapter.</p></div><Engagements /></div></section>
    <section className="section"><div className="container"><div className="editorial-heading"><div><p className="eyebrow">A little more clarity</p><h2>Good questions.</h2></div></div><Faqs /></div></section>
    <FinalCta />
  </>;
}
