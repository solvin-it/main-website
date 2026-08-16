import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy & Responsible AI", description: "How Solvin handles readiness assessment data and responsible AI boundaries." };

export default function PrivacyPage() {
  return <>
    <section className="page-hero"><div className="container page-hero-grid"><div><p className="eyebrow">Privacy &amp; responsible AI</p><h1 className="display">Clear boundaries for useful systems.</h1></div><div className="page-hero-aside"><p className="subtitle">Practical safeguards for public assessments, contact information, model-assisted work, and responsible human review.</p></div></div></section>
    <section className="section"><div className="container narrow prose"><h2>Readiness Advisor data</h2><p>Information shared through the advisor is used to understand your workflow and prepare a relevant recommendation. A high-level description is enough.</p><h2>Do not share sensitive information</h2><p>Please do not submit passwords, API keys, customer records, financial account details, confidential documents, or regulated personal data through the public website.</p><h2>Human review</h2><p>AI can help draft, summarize, classify, and route work. Sensitive or high-impact outputs should be reviewed by a responsible person before being sent, approved, or recorded.</p><h2>Data handling</h2><p>Lead and assessment records are stored only through configured service providers. Production deployments should set an appropriate retention period and provide a contact channel for access or deletion requests.</p><h2>AI limitations</h2><p>The readiness result is an initial recommendation, not a guarantee of technical feasibility, cost, compliance, or business outcome. Detailed product and system discovery is required before implementation.</p></div></section>
  </>;
}
