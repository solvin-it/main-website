import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FinalCta } from "@/components/marketing";

export const metadata: Metadata = { title: "About Jose", description: "The founder behind Solvin's product design, systems thinking, and software engineering." };

export default function AboutPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="measure-label">Founder-led Solvin</p><h1 className="display">Direct judgment. Clear accountability.</h1></div><div className="page-hero-aside"><p className="subtitle">You work directly with the person shaping the product and building the system, with collaborators brought in when the work calls for them.</p></div></div></section>
    <section className="section"><div className="container studio-story"><div className="studio-portrait"><Image src="/solvin-mark.svg" alt="" width={280} height={280} /></div><div className="prose"><p className="eyebrow">Solvin / Manila</p><h2 className="title">Business context and technical execution belong together.</h2><p>Solvin is led by Jose Fernando A. Gonzales, a technical solutions professional with experience across business analysis, FinTech systems, API integration, workflow design, cloud-native platforms, process improvement, and applied AI.</p><p>That background shapes the studio’s work: understand the operating reality, define the right product, build the complete system, and improve it based on real use.</p><p>The goal is not to add AI everywhere. It is to create software that handles complexity clearly, uses intelligence responsibly, and leaves accountable people in control.</p><Link className="text-link" href="/contact">Start a conversation <ArrowRight size={16} /></Link></div></div></section>
    <section className="section section-tone"><div className="container"><p className="eyebrow">Working principles</p><div className="principle-list"><article><span>01</span><h3>Clarity before tooling</h3><p>Define the problem and the product behavior before choosing the model or automation stack.</p></article><article><span>02</span><h3>Interfaces are part of the system</h3><p>The experience, operational workflow, data, intelligence, and review controls must be designed together.</p></article><article><span>03</span><h3>Production over performance</h3><p>Reliability, failure handling, accessibility, documentation, and ownership matter more than a flashy demonstration.</p></article><article><span>04</span><h3>Evidence over hype</h3><p>Show the work honestly, name current limitations, and make claims only when there is an outcome to support them.</p></article></div></div></section>
    <FinalCta />
  </>;
}
