import QRCode from "qrcode";
import { cardUrl, cards, getCard } from "@/lib/cards";

export function generateStaticParams() {
  return cards.map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return new Response("Not found", { status: 404 });

  const svg = await QRCode.toString(cardUrl(card), { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: "#17191d", light: "#ffffff" } });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
