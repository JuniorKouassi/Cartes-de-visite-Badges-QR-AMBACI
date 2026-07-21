import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStaffBySlug } from "@/lib/staff";
import { generateQrPng } from "@/lib/qr";

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const slug = filename.replace(/\.png$/i, "");

  const staff = await getStaffBySlug(getDb(), slug);
  if (!staff) notFound();

  const cardUrl = new URL(`/c/${staff.slug}`, request.url).toString();
  const png = await generateQrPng(cardUrl);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="carte-${staff.slug}-qr.png"`,
    },
  });
}
