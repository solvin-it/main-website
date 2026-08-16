import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { Footer, Header } from "@/components/site-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solvin.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solvin | AI Product & Systems Studio",
    template: "%s | Solvin",
  },
  description:
    "Solvin designs and builds AI-native web and mobile products, internal tools, agents, and workflow systems.",
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
    description: "Intelligent software, shaped around real work.",
    type: "website",
    url: siteUrl,
    siteName: "Solvin Solutions",
    images: [{ url: "/solvin-social.svg", width: 1200, height: 630, alt: "Solvin — Intelligent software, shaped around real work." }],
  },
  twitter: { card: "summary_large_image", title: "Solvin | AI Product & Systems Studio", description: "Intelligent software, shaped around real work.", images: ["/solvin-social.svg"] },
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
    <html lang="en" suppressHydrationWarning>
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
