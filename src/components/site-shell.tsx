"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["Experience", "/#experience"],
  ["Capabilities", "/capabilities"],
  ["About", "/about"],
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
  const pathname = usePathname();
  const assistantHref = pathname === "/" ? "#assistant-workspace" : "/readiness#assistant-workspace";

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
          {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
          <Link className="btn btn-primary nav-cta" href={assistantHref}>Try the Assistant <ArrowUpRight size={15} /></Link>
          <ThemeToggle />
        </nav>
        <div className="mobile-actions">
          <Link className="btn btn-primary mobile-assistant-link" href={assistantHref} onClick={() => setOpen(false)}>The Assistant <ArrowUpRight size={14} /></Link>
          <ThemeToggle />
          <button className="icon-button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            <span className="sr-only">Toggle navigation</span>{open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile">
          {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href={assistantHref} onClick={() => setOpen(false)}>Start a conversation <span aria-hidden="true">↗</span></Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Direct contact <span aria-hidden="true">↗</span></Link>
          <div className="mobile-menu-theme"><ThemeToggle /></div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-intro">
        <p className="footer-statement">Your next chapter.<br /><span>Beautifully built.</span></p>
        <Link className="footer-project-link" href="/readiness#assistant-workspace">Let’s make something great <ArrowUpRight size={23} /></Link>
      </div>
      <div className="container footer-grid">
        <div className="footer-brand"><Logo /><p>Website development. Agent development.<br />Independent by design. Built with care.</p></div>
        <div><p className="eyebrow">Explore</p>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div><p className="measure-label">Tools &amp; contact</p><Link href="/readiness#assistant-workspace">The Assistant</Link><Link href="/contact">Direct contact</Link><Link href="/privacy">Privacy</Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Solvin. Thoughtfully made.</span><span>A clearer perspective. A better way forward.</span></div>
    </footer>
  );
}
