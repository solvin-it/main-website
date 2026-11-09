import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarCheck, Download, Mail, Sparkles } from "lucide-react";
import { cardUrl, cards, fullName, getCard, initials } from "@/lib/cards";
import "@/components/card.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return cards.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const card = getCard((await params).slug);
  if (!card) return {};
  const title = `${fullName(card)} · ${card.title}`;
  return {
    title,
    description: `${card.title} at ${card.organization}. Save contact details, send an email, or start a conversation.`,
    alternates: { canonical: cardUrl(card) },
    robots: { index: false, follow: false },
    openGraph: { title, description: `${card.title} at ${card.organization}`, url: cardUrl(card), type: "profile" },
  };
}

export default async function CardPage({ params }: Props) {
  const card = getCard((await params).slug);
  if (!card) notFound();

  const name = fullName(card);
  const bookingUrl = card.bookable ? process.env.NEXT_PUBLIC_CALCOM_URL : undefined;

  return (
    <section className="card-page">
      <article className="card" aria-labelledby="card-name">
        <header className="card-head">
          <span className="card-monogram" aria-hidden="true">{initials(card)}</span>
          <Image className="card-mark" src="/solvin-mark.svg" alt="" width={34} height={34} />
        </header>

        <p className="card-org">{card.organization}</p>
        <h1 id="card-name" className="card-name">{name}</h1>
        <p className="card-title">{card.title}</p>
        <p className="card-tagline">{card.tagline}</p>

        <div className="card-actions">
          <a className="btn btn-primary" href={`/card/${card.slug}/vcard`} download>
            Save contact <Download size={16} aria-hidden="true" />
          </a>
          <a className="btn btn-secondary" href={`mailto:${card.email}`}>
            <span className="card-email">{card.email}</span> <Mail size={16} aria-hidden="true" />
          </a>
          {bookingUrl && (
            <a className="btn btn-secondary" href={bookingUrl} target="_blank" rel="noopener noreferrer">
              Book a call <CalendarCheck size={16} aria-hidden="true" />
            </a>
          )}
          <Link className="btn btn-secondary" href="/readiness#assistant-workspace">
            Try the AI readiness check <Sparkles size={16} aria-hidden="true" />
          </Link>
        </div>

        <footer className="card-share">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="card-qr" src={`/card/${card.slug}/qr`} alt={`QR code that opens ${name}'s card`} width={112} height={112} />
          <div>
            <p className="card-share-label">Share this card</p>
            <p className="card-share-text">Scan to open on another phone.</p>
            <Link className="card-share-link" href="/">solvin.co <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
        </footer>
      </article>
    </section>
  );
}
