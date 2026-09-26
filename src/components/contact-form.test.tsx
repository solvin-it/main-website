import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function fillInquiry() {
  fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Test Visitor" } });
  fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText("What are you looking to build or improve? *"), { target: { value: "A shared system to organize incoming customer requests." } });
}

describe("contact inquiry", () => {
  it("shows success and resets the form after an asynchronous response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }));
    render(<ContactForm />);
    fillInquiry();
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    await waitFor(() => expect(screen.getByText(/Your inquiry was received/)).toBeTruthy());
    expect(screen.queryByRole("alert")).toBeNull();
    expect((screen.getByLabelText("Name *") as HTMLInputElement).value).toBe("");
  });

  it("preserves the inquiry when delivery fails so the visitor can retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Please try again later." }) }));
    render(<ContactForm />);
    fillInquiry();
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Please try again later."));
    expect((screen.getByLabelText("Name *") as HTMLInputElement).value).toBe("Test Visitor");
    expect((screen.getByLabelText("Email *") as HTMLInputElement).value).toBe("test@example.com");
  });
});
