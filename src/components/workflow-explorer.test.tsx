import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkflowExplorer } from "./workflow-explorer";

afterEach(cleanup);

describe("workflow exploration", () => {
  it("carries the selected business problem into a fresh Assistant conversation", () => {
    render(<WorkflowExplorer />);
    fireEvent.click(screen.getByRole("button", { name: "Knowledge is scattered" }));
    expect(screen.getByRole("heading", { name: "The answer, without the search." })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Knowledge is scattered" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Requests get lost" }).getAttribute("aria-pressed")).toBe("false");
    const link = screen.getByRole("link", { name: "Explore this for my business" });
    const url = new URL(link.getAttribute("href")!, "https://solvin.co");
    expect(url.pathname).toBe("/readiness");
    expect(url.searchParams.get("new")).toBe("1");
    expect(url.searchParams.get("prompt")).toContain("source references");
    expect(url.searchParams.get("prompt")).not.toContain("Customer requests");
    expect(url.hash).toBe("#assistant-workspace");
  });
});
