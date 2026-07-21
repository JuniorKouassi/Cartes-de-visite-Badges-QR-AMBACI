import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStaffByMatricule } from "@/lib/staff";
import { generateQrPng } from "@/lib/qr";

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const matricule = filename.replace(/\.png$/i, "");

  const staff = await getStaffByMatricule(getDb(), matricule);
  if (!staff) notFound();

  const verifyUrl = new URL(`/verify/${staff.matricule}`, request.url).toString();
  const png = await generateQrPng(verifyUrl);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      "Content-Disposition": `inline; filename="badge-${staff.matricule}-qr.png"`,
    },
  });
}
