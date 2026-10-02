"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import "./assistant-studio-frame.css";

type AssistantStudioFrameProps = {
  expanded: boolean;
  onClose: () => void;
  children: ReactNode;
  blueprint: ReactNode;
};

type Pane = "conversation" | "blueprint";
const panes: Pane[] = ["conversation", "blueprint"];
const mobileQuery = "(max-width: 759px)";

function subscribeViewport(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function mobileViewport() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.(mobileQuery).matches);
}

function restoreFocus(element: HTMLElement | null) {
  if (!element) return true;
  if (element.isConnected) {
    element.focus({ preventScroll: true });
    return true;
  }
  // The compact conversation can remount when it returns from the portal.
  const replacement = element.id ? document.getElementById(element.id) : null;
  const label = element.getAttribute("aria-label");
  const labelledReplacement = label ? Array.from(document.querySelectorAll<HTMLElement>("button, a[href], input, textarea, select, [tabindex]"))
    .find(candidate => candidate.tagName === element.tagName && candidate.getAttribute("aria-label") === label) : null;
  const target = replacement ?? labelledReplacement;
  target?.focus({ preventScroll: true });
  return Boolean(target);
}

export function AssistantStudioFrame({ expanded, onClose, children, blueprint }: AssistantStudioFrameProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const conversationRef = useRef<HTMLElement>(null);
  const blueprintRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastOutsideFocusRef = useRef<HTMLElement | null>(null);
  const [activePane, setActivePane] = useState<Pane>("conversation");
  const isMobile = useSyncExternalStore(subscribeViewport, mobileViewport, () => false);

  useEffect(() => {
    const rememberFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && !dialogRef.current?.contains(event.target)) {
        lastOutsideFocusRef.current = event.target;
      }
    };
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      lastOutsideFocusRef.current = document.activeElement;
    }
    document.addEventListener("focusin", rememberFocus);
    return () => document.removeEventListener("focusin", rememberFocus);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!expanded || !dialog) return;
    const previouslyFocused = lastOutsideFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    const composer = conversationRef.current?.hasAttribute("inert") ? null : conversationRef.current?.querySelector<HTMLElement>(
      ".assistant-composer textarea:not(:disabled), .assistant-composer input:not(:disabled), textarea:not(:disabled), input:not(:disabled)",
    );
    (composer ?? closeRef.current)?.focus({ preventScroll: true });

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (!restoreFocus(previouslyFocused)) {
        const restoreAfterRemount = () => { restoreFocus(previouslyFocused); };
        if (window.requestAnimationFrame) window.requestAnimationFrame(restoreAfterRemount);
        else queueMicrotask(restoreAfterRemount);
      }
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !isMobile) return;
    const inactivePane = activePane === "conversation" ? blueprintRef.current : conversationRef.current;
    if (inactivePane?.contains(document.activeElement)) {
      tabRefs.current[panes.indexOf(activePane)]?.focus();
    }
  }, [expanded, isMobile, activePane]);

  function closeStudio() {
    setActivePane("conversation");
    onClose();
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % panes.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex + panes.length - 1) % panes.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = panes.length - 1;
    else return;
    event.preventDefault();
    setActivePane(panes[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  if (!expanded || typeof document === "undefined") return <>{children}</>;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="assistant-studio-dialog"
      aria-labelledby={`${id}-title`}
      onCancel={event => {
        event.preventDefault();
        closeStudio();
      }}
    >
      <div className="assistant-studio-frame">
        <header className="assistant-studio-frame-header">
          <div>
            <p className="assistant-studio-frame-eyebrow">Solvin <span>/</span> Assistant studio</p>
            <h2 id={`${id}-title`}>Your idea. A clearer direction.</h2>
          </div>
          <button ref={closeRef} className="assistant-studio-frame-close" type="button" onClick={closeStudio} aria-label="Close assistant studio">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="assistant-studio-frame-tabs" role="tablist" aria-label="Assistant studio views">
          {panes.map((pane, index) => (
            <button
              key={pane}
              ref={element => { tabRefs.current[index] = element; }}
              id={`${id}-${pane}-tab`}
              role="tab"
              type="button"
              aria-controls={`${id}-${pane}-panel`}
              aria-selected={activePane === pane}
              tabIndex={activePane === pane ? 0 : -1}
              onClick={() => setActivePane(pane)}
              onKeyDown={event => navigateTabs(event, index)}
            >
              {pane === "conversation" ? "Conversation" : "Blueprint"}
            </button>
          ))}
        </div>
        <div className="assistant-studio-frame-body">
          <section
            ref={conversationRef}
            id={`${id}-conversation-panel`}
            className="assistant-studio-frame-pane assistant-studio-frame-conversation"
            data-active={activePane === "conversation"}
            role={isMobile ? "tabpanel" : undefined}
            aria-labelledby={isMobile ? `${id}-conversation-tab` : undefined}
            aria-hidden={isMobile && activePane !== "conversation" ? true : undefined}
            inert={isMobile && activePane !== "conversation" ? true : undefined}
          >
            {children}
          </section>
          <section
            ref={blueprintRef}
            id={`${id}-blueprint-panel`}
            className="assistant-studio-frame-pane assistant-studio-frame-blueprint"
            data-active={activePane === "blueprint"}
            role={isMobile ? "tabpanel" : undefined}
            aria-labelledby={isMobile ? `${id}-blueprint-tab` : undefined}
            aria-hidden={isMobile && activePane !== "blueprint" ? true : undefined}
            inert={isMobile && activePane !== "blueprint" ? true : undefined}
          >
            {blueprint}
          </section>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
