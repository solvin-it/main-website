import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Recommendation } from "@/lib/types";
import { ProjectBlueprint } from "./project-blueprint";

afterEach(cleanup);

describe("project blueprint", () => {
  it("shows an honest scaffold before any details are confirmed", () => {
    render(<ProjectBlueprint />);
    expect(screen.getByRole("heading", { name: "Your idea starts the story." })).toBeTruthy();
    expect(screen.getByText("Who we’re building this for")).toBeTruthy();
    expect(screen.getByText("We’ll explore this together.")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("replaces only the details supplied by the server and reflects subsequent changes", () => {
    const { rerender } = render(<ProjectBlueprint preview={{ answerCount: 2, goal: "An agent for our repair team", tools: ["Gmail", "Airtable"] }} />);
    expect(screen.getByText("An agent for our repair team")).toBeTruthy();
    expect(screen.getByText("Gmail · Airtable")).toBeTruthy();
    expect(screen.getByText("Who we’re building this for")).toBeTruthy();
    expect(screen.queryByText("Your idea starts the story.")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("2 project details captured");

    rerender(<ProjectBlueprint preview={{ answerCount: 3, goal: "An agent for our repair team", audience: "Technicians", tools: ["Gmail", "Airtable"] }} busy />);
    expect(screen.getByText("Technicians")).toBeTruthy();
    expect(screen.queryByText("Who we’re building this for")).toBeNull();
    expect(screen.getByText("Thinking through your latest message…")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("3 project details captured");
  });

  it("offers the full starting brief as a download without asking for contact details", () => {
    const recommendation: Recommendation = {
      workflowSummary: "A shared repair intake workflow <script>alert('hi')</script>", opportunity: "Each request reaches the right technician",
      blocker: "Confirm the team's intake tools", firstProject: "One shared queue with approval before dispatch",
      recommendedService: "An AI agent connected to the existing intake system", nextAction: "Review a sample request with Solvin",
    };
    render(<ProjectBlueprint preview={{ answerCount: 5, service: "AI agent", successMetric: "Fewer lost requests" }} recommendation={recommendation} />);
    expect(screen.getByRole("article", { name: "Your project brief" })).toBeTruthy();
    expect(screen.getByText("Starting brief · for review")).toBeTruthy();
    expect(screen.getByText("Fewer lost requests")).toBeTruthy();
    expect(screen.getByText(recommendation.firstProject)).toBeTruthy();
    const download = screen.getByRole("link", { name: "Download your project brief" });
    expect(download.getAttribute("download")).toBe("solvin-project-brief.html");
    const documentHref = decodeURIComponent(download.getAttribute("href")!);
    expect(documentHref).toMatch(/^data:text\/html;charset=utf-8,<!doctype html>/);
    expect(documentHref).toContain("&lt;script&gt;");
    const downloadedDocument = new DOMParser().parseFromString(documentHref.split("charset=utf-8,")[1], "text/html");
    expect(downloadedDocument.querySelector("script")).toBeNull();
    expect(downloadedDocument.querySelector("main")?.textContent).toContain(recommendation.workflowSummary);
    expect(downloadedDocument.querySelector("main")?.textContent).toContain(recommendation.nextAction);
    expect(downloadedDocument.querySelector("main")?.textContent).toContain("Fewer lost requests");
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
