import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getConsularHolderByCardNumber } from "@/lib/consularHolders";
import { generateQrPng } from "@/lib/qr";

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const cardNumber = filename.replace(/\.png$/i, "");

  const holder = await getConsularHolderByCardNumber(getDb(), cardNumber);
  if (!holder) notFound();

  const verifyUrl = new URL(`/verify-consulaire/${holder.card_number}`, request.url).toString();
  const png = await generateQrPng(verifyUrl);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="carte-consulaire-${holder.card_number}-qr.png"`,
    },
  });
}
