import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getStaffBySlug } from "@/lib/staff";
import { CardView } from "./CardView";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const staff = await getStaffBySlug(getDb(), slug);
  return { title: staff ? `${staff.full_name} — Carte de visite` : "Carte de visite" };
}

export default async function CardPage({ params }: { params: Params }) {
  const { slug } = await params;
  const staff = await getStaffBySlug(getDb(), slug);
  if (!staff || !staff.active) notFound();

  const qrSrc = `/qr/card/${staff.slug}.png`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-[linear-gradient(135deg,#F77F00_0%,#FFA040_28%,#FFE8C2_50%,#8FD9A8_65%,#009A44_88%,#007A35_100%)] print:bg-none">
      <CardView staff={staff} qrSrc={qrSrc} />
    </main>
  );
}
