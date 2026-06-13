import {
  BookOpenCheck, Bot, Braces, ClipboardCheck, FileSearch, Gauge, Layers3,
  Network, RefreshCcw, ShieldCheck, Sparkles, Workflow,
} from "lucide-react";

export const services = [
  { title: "AI Workflow Readiness Check", icon: Gauge, description: "A guided assessment that identifies useful automation opportunities and the right first step.", bestFor: "Teams unsure where to begin", deliverables: ["Readiness category", "Opportunity summary", "Recommended next action"] },
  { title: "Workflow Automation Audit", icon: FileSearch, description: "A structured review of workflows, tools, handoffs, bottlenecks, and implementation options.", bestFor: "Manual, admin-heavy operations", deliverables: ["Workflow map", "Priority matrix", "Implementation roadmap"] },
  { title: "AI Workflow Prototype", icon: Sparkles, description: "A focused sprint that proves how AI can assist a real workflow before a larger investment.", bestFor: "Validating one practical use case", deliverables: ["Working prototype", "Test scenarios", "Improvement backlog"] },
  { title: "Automation Implementation", icon: Workflow, description: "Production-minded workflows built with APIs, n8n, databases, and human approval steps.", bestFor: "Teams ready to put automation to work", deliverables: ["Implemented workflow", "Error handling", "Documentation and handover"] },
  { title: "AI Agent & Knowledge Systems", icon: Bot, description: "Assistants that retrieve information, use tools, and support multi-step business work with oversight.", bestFor: "Knowledge-rich and repeatable work", deliverables: ["Assistant design", "Retrieval setup", "Guardrails and testing"] },
];

export const painPoints = [
  { title: "Repetitive admin", icon: RefreshCcw, text: "Reports, updates, emails, summaries, and records are recreated every week." },
  { title: "Scattered knowledge", icon: BookOpenCheck, text: "SOPs, templates, policies, and client information are difficult to find and reuse." },
  { title: "Disconnected tools", icon: Network, text: "Work moves between email, spreadsheets, CRMs, and chat without a clear system." },
  { title: "Unclear AI use cases", icon: Braces, text: "The opportunity is visible, but the safe and useful first project is not." },
];

export const processSteps = [
  ["01", "Understand the workflow", "Clarify the process, tools, documents, people, and pain points."],
  ["02", "Find the right opportunity", "Choose work where automation is useful, safe, and worth implementing."],
  ["03", "Design the system", "Define data sources, triggers, actions, approvals, and failure handling."],
  ["04", "Build and test", "Implement with the appropriate stack and test against realistic scenarios."],
  ["05", "Handover and improve", "Document the system and refine it from actual business use."],
];

export const trustPillars = [
  { title: "Workflow-first", icon: Layers3, text: "Understand the process before selecting a tool." },
  { title: "Human-in-the-loop", icon: ClipboardCheck, text: "Keep responsible people in control of important outcomes." },
  { title: "Responsible data use", icon: ShieldCheck, text: "Use access controls, minimal exposure, and clear boundaries." },
];

export const faqs = [
  ["Do I need a documented process first?", "No. Mapping and clarifying the workflow can be the first deliverable."],
  ["Will AI replace my staff?", "The focus is reducing repetitive work and helping people spend time on higher-value tasks."],
  ["Can you work with our current tools?", "Yes. The preferred approach uses your existing tools where practical and connects them carefully."],
  ["What if we are not ready for AI?", "That is a useful outcome. Workflow cleanup or simple automation may be the better first step."],
  ["How is sensitive data handled?", "Initial assessments need only a high-level description. Production systems are designed with access controls, minimal exposure, and review."],
];
