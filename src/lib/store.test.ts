import { describe, expect, it } from "vitest";
import { sessionFromRow } from "./store";

describe("Supabase session reconstruction", () => {
  it("restores pending assessment results and linked lead details", () => {
    const session = sessionFromRow({
      id: "session-1",
      current_stage: "contact",
      answer_count: 6,
      entry_page: "/services",
      utm_source: "linkedin",
      utm_medium: "social",
      utm_campaign: "launch",
      completed_at: null,
      summary: "Weekly reporting workflow",
      assessment_facts: [
        { fact_key: "painPoint", fact_value: "Weekly reporting takes too long" },
        { fact_key: "processConsistency", fact_value: "mostly_same" },
      ],
      readiness_scores: [{
        workflow_clarity_score: 100,
        repetition_score: 85,
        data_tool_readiness_score: 75,
        business_impact_score: 75,
        risk_manageability_score: 85,
        total_score: 85,
        category: "AI Agent or Knowledge System Candidate",
        rationale: "Strong recurring workflow.",
      }],
      recommendations: [{
        recommended_service: "AI Workflow Prototype",
        recommendation_summary: "Prepare and route the report for review.",
        suggested_first_project: "Prototype the weekly report.",
        risks_to_review: ["Confirm approval rules."],
        next_step: "Book a discovery call.",
      }],
      lead: {
        full_name: "Alex Rivera",
        email: "alex@example.com",
        company_name: "Example Co",
        role_title: "Operations Lead",
        consent_to_contact: true,
      },
    });

    expect(session.score).toEqual({
      workflowClarity: 100,
      repetition: 85,
      dataToolReadiness: 75,
      businessImpact: 75,
      riskManageability: 85,
      total: 85,
      category: "AI Agent or Knowledge System Candidate",
      rationale: "Strong recurring workflow.",
    });
    expect(session.recommendation).toEqual({
      workflowSummary: "Weekly reporting workflow",
      opportunity: "Prepare and route the report for review.",
      blocker: "Confirm approval rules.",
      firstProject: "Prototype the weekly report.",
      recommendedService: "AI Workflow Prototype",
      nextAction: "Book a discovery call.",
    });
    expect(session.lead).toEqual({
      fullName: "Alex Rivera",
      email: "alex@example.com",
      companyName: "Example Co",
      roleTitle: "Operations Lead",
      consentToContact: true,
    });
    expect(session.utm).toEqual({ source: "linkedin", medium: "social", campaign: "launch" });
  });

  it("handles sessions without optional related records", () => {
    const session = sessionFromRow({
      id: "session-2",
      current_stage: "opening",
      answer_count: null,
      entry_page: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      completed_at: null,
      summary: null,
      assessment_facts: null,
      readiness_scores: null,
      recommendations: null,
      lead: null,
    });

    expect(session).toEqual({
      id: "session-2",
      stage: "opening",
      answerCount: 0,
      facts: {},
    });
  });
});
