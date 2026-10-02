import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer, Header } from "@/components/site-shell";
import "./globals.css";
import "@/components/spectacle.css";
import "@/components/assistant-studio.css";
import "@/components/capability-playground.css";

const inter = localFont({ src: "./fonts/inter-latin.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });
const sora = localFont({ src: "./fonts/sora-latin.woff2", variable: "--font-sora", weight: "100 800", display: "swap" });
const mono = localFont({ src: "./fonts/jetbrains-mono-latin.woff2", variable: "--font-mono", weight: "100 800", display: "swap", preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solvin.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solvin | Beautiful websites. Brilliant agents.",
    template: "%s | Solvin",
  },
  description:
    "An independent digital studio building distinctive websites, applications, and intelligent agents. Experience thoughtful design and engineering, and explore your idea with the Solvin Assistant.",
  keywords: [
    "AI product studio",
    "AI-native application development",
    "AI web application development",
    "AI mobile application development",
    "AI agent and workflow systems",
  ],
  icons: { icon: "/solvin-mark.svg", shortcut: "/solvin-mark.svg", apple: "/solvin-mark.svg" },
  openGraph: {
    title: "Solvin Solutions",
    description: "Beautiful websites. Brilliant agents. Thoughtful design and intelligent engineering, together.",
    type: "website",
    url: siteUrl,
    siteName: "Solvin Solutions",
    images: [{ url: "/solvin-social.svg", width: 1200, height: 630, alt: "Solvin — Beautiful websites. Brilliant agents." }],
  },
  twitter: { card: "summary_large_image", title: "Solvin | Beautiful websites. Brilliant agents.", description: "Thoughtful design and intelligent engineering, together.", images: ["/solvin-social.svg"] },
};

const themeScript = `
  (() => {
    try {
      const saved = localStorage.getItem("solvin-theme");
      const dark = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    } catch {}
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${sora.variable} ${mono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Solvin Solutions",
            url: siteUrl,
            description: "AI-native product development and intelligent systems for operators and founders.",
            serviceType: ["AI product development", "Web application development", "Mobile application development", "AI agents", "Workflow systems"],
          }) }}
        />
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
