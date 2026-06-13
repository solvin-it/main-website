import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { Footer, Header } from "@/components/site-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solvin.solutions";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solvin Solutions | Practical AI Workflow Automation",
    template: "%s | Solvin Solutions",
  },
  description:
    "Practical AI automation, workflow consulting, and knowledge systems designed around how your business actually works.",
  keywords: [
    "AI automation consultant",
    "AI workflow automation",
    "AI readiness assessment",
    "AI agent development",
    "n8n automation consultant",
  ],
  openGraph: {
    title: "Solvin Solutions",
    description: "Build AI workflows that make your business easier to run.",
    type: "website",
    url: siteUrl,
    siteName: "Solvin Solutions",
    images: [{ url: "/solvin-logo.png", width: 1024, height: 1024 }],
  },
  twitter: { card: "summary_large_image" },
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
            description: "Practical AI workflow automation and consulting.",
            serviceType: ["AI workflow automation", "AI readiness assessment", "AI agent development"],
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
