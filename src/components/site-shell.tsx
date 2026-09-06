"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["What we build", "/capabilities"],
  ["How we work", "/#method"],
  ["About Jose", "/about"],
] as const;

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDark(document.documentElement.dataset.theme === "dark"));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("solvin-theme", next ? "dark" : "light");
  }

  return (
    <button className="icon-button" onClick={toggle} aria-label={`Use ${dark ? "light" : "dark"} theme`}>
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="Solvin home">
      <Image className="brand-mark" src="/solvin-mark.svg" alt="" width={44} height={44} priority />
      <span className="brand-name">Solvin</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link className="btn btn-primary nav-cta" href="/readiness?new=1#assistant-workspace">Start a conversation</Link>
          <ThemeToggle />
        </nav>
        <div className="mobile-actions">
          <ThemeToggle />
          <button className="icon-button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            <span className="sr-only">Toggle navigation</span>{open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/readiness?new=1#assistant-workspace" onClick={() => setOpen(false)}>Start a conversation <span aria-hidden="true">↗</span></Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-intro">
        <p className="footer-statement">Useful software begins<br />with understanding the work.</p>
        <Link className="footer-project-link" href="/readiness?new=1#assistant-workspace">Start a conversation <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand"><Logo /><p>Founder-led product design and engineering from Manila, working globally.</p></div>
        <div><p className="eyebrow">Explore</p>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div><p className="measure-label">Tools &amp; contact</p><Link href="/readiness#assistant-workspace">The Assistant</Link><Link href="/contact">Direct contact</Link><Link href="/privacy">Privacy</Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Solvin.</span><span>From work to working software.</span></div>
    </footer>
  );
}
