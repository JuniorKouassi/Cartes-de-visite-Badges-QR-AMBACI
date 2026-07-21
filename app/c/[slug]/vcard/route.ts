import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStaffBySlug } from "@/lib/staff";
import { buildVCard } from "@/lib/vcard";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staff = await getStaffBySlug(getDb(), slug);
  if (!staff || !staff.active) notFound();

  const cardUrl = new URL(`/c/${staff.slug}`, request.url).toString();
  const vcard = buildVCard(staff, cardUrl);

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${staff.slug}.vcf"`,
    },
  });
}
