import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Approach, CapabilityStrip, FeaturedWork, FinalCta, PracticeGrid, SectionHeading } from "@/components/marketing";

export default function Home() {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div><p className="eyebrow">AI product &amp; systems studio · Manila / Global</p><h1 className="display">Intelligent software, shaped around real work.</h1></div>
        <div className="hero-aside">
          <p className="subtitle">Solvin designs and builds AI-native web and mobile products, internal tools, agents, and workflow systems—from first idea to production.</p>
          <div className="button-row"><Link className="btn btn-blue" href="/contact">Start a project <ArrowRight size={17} /></Link><Link className="text-link" href="/capabilities">See how we build</Link></div>
          <p className="hero-note">For operators and founders turning complex work into useful software.</p>
        </div>
      </div>
      <CapabilityStrip />
    </section>

    <section className="section"><div className="container"><SectionHeading eyebrow="Selected systems / 01" title="Show the software, not the AI aesthetic." text="Real interfaces and implementation details make the work easier to evaluate than abstract promises." /><FeaturedWork /></div></section>

    <section className="section section-tone"><div className="container"><SectionHeading eyebrow="Two connected practices" title="Build the product. Improve the system around it." text="Solvin works across customer experiences and internal operations because useful AI products rarely stop at the interface." /><PracticeGrid /></div></section>

    <section className="section" id="approach"><div className="container"><SectionHeading eyebrow="Approach" title="A disciplined path from ambiguity to working software." text="Product judgment, system design, and implementation stay connected from the first conversation through launch." /><Approach /></div></section>

    <section className="section section-tone"><div className="container studio-preview"><div className="studio-monogram"><Image src="/solvin-mark.svg" alt="" width={240} height={240} /></div><div className="studio-copy"><p className="eyebrow">The studio</p><h2 className="title">Business context and technical execution belong together.</h2><p className="subtitle">Solvin combines business analysis, product thinking, API and cloud systems, process improvement, and applied AI. The result is software designed around the work it must support.</p><Link className="text-link" href="/about">Meet the studio <ArrowRight size={16} /></Link></div></div></section>

    <FinalCta />
  </>;
}
