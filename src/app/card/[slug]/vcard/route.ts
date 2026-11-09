import { buildVCard, cards, fullName, getCard } from "@/lib/cards";

export function generateStaticParams() {
  return cards.map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return new Response("Not found", { status: 404 });

  return new Response(buildVCard(card), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fullName(card).replace(/\s+/g, "-")}.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
