"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Services", "/services"],
  ["Readiness Check", "/readiness"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

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
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="Solvin Solutions home">
      <span className="logo-wrap"><Image src="/solvin-logo-mini.png" alt="" width={34} height={34} /></span>
      <span>Solvin<span className="brand-light"> Solutions</span></span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <Link className="btn btn-primary nav-cta" href="/readiness">Start the check</Link>
          <ThemeToggle />
        </nav>
        <div className="mobile-actions">
          <ThemeToggle />
          <button className="icon-button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            <span className="sr-only">Toggle navigation</span>{open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><Logo /><p className="muted">Practical AI automation, designed around how your business actually works.</p></div>
        <div><p className="eyebrow">Explore</p>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div><p className="eyebrow">Responsible AI</p><Link href="/privacy">Privacy & data handling</Link><p className="muted">Human-led. AI-assisted.</p></div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} Solvin Solutions. AI systems that solve.</div>
    </footer>
  );
}
