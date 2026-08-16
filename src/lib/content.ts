export const practices = [
  {
    number: "01",
    label: "Product experiences",
    title: "AI-native applications",
    description: "Customer-facing and team-facing software where intelligence is part of the product experience, not a chatbot added after the fact.",
    items: ["Web applications and SaaS", "Mobile and cross-platform products", "Copilots, search, and recommendations", "Product design, engineering, and launch"],
  },
  {
    number: "02",
    label: "Intelligent operations",
    title: "Systems that improve work",
    description: "Agents, internal tools, integrations, and workflows designed around the people, approvals, data, and exceptions already in the business.",
    items: ["Agentic workflows and automation", "Knowledge and document systems", "Operational tools and dashboards", "APIs, integrations, and observability"],
  },
];

export const approachSteps = [
  ["01", "Understand", "Clarify the people, problem, workflow, data, constraints, and desired outcome."],
  ["02", "Shape", "Define the smallest useful product and the system that needs to support it."],
  ["03", "Build", "Design and engineer the interface, intelligence, integrations, and controls together."],
  ["04", "Validate", "Test with realistic inputs, edge cases, responsible review, and measurable acceptance criteria."],
  ["05", "Improve", "Launch with documentation, observability, and a focused backlog informed by real use."],
];

export const engagements = [
  { number: "01", title: "Discovery", duration: "1–2 weeks", text: "Turn an operational problem or product idea into a clear opportunity, system outline, and build recommendation." },
  { number: "02", title: "Product build", duration: "Focused delivery", text: "Design and build a working web, mobile, agent, or internal product with production-minded foundations." },
  { number: "03", title: "Ongoing engineering", duration: "Continued partnership", text: "Improve an existing product, extend integrations, strengthen reliability, and ship the next valuable capability." },
];

export const faqs = [
  ["What does AI-native mean in practice?", "It means intelligence is designed into the product, workflow, data model, and review experience from the beginning. It does not mean handing product decisions to a model."],
  ["Can Solvin build both the interface and the AI system?", "Yes. Product design, web and mobile implementation, model integration, retrieval, workflow orchestration, and operational controls are treated as one system."],
  ["Do we need a fully defined product brief?", "No. Discovery can turn an operating problem or early product idea into a focused scope before implementation begins."],
  ["Can you work with our current tools and data?", "Yes. The preferred approach keeps useful systems in place and adds interfaces, APIs, and automation where they create clear value."],
  ["How are sensitive or high-impact decisions handled?", "Systems are designed with minimal data exposure, explicit boundaries, traceable behavior, and human review wherever the outcome requires accountable judgment."],
];
