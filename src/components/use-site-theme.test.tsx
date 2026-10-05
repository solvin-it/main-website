import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useDarkTheme } from "./use-site-theme";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.theme;
});

describe("site theme subscription", () => {
  it("reads the saved theme immediately", () => {
    document.documentElement.dataset.theme = "dark";
    const { result } = renderHook(useDarkTheme);
    expect(result.current).toBe(true);
  });

  it("follows theme switches without remounting the consumer", async () => {
    document.documentElement.dataset.theme = "light";
    const { result } = renderHook(useDarkTheme);
    expect(result.current).toBe(false);
    await act(async () => { document.documentElement.dataset.theme = "dark"; });
    expect(result.current).toBe(true);
    await act(async () => { document.documentElement.dataset.theme = "light"; });
    expect(result.current).toBe(false);
  });
});
