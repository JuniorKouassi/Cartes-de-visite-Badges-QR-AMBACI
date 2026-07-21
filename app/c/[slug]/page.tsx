import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getStaffBySlug } from "@/lib/staff";
import { BusinessCardFront, BusinessCardBack } from "@/components/BusinessCard";
import { CardFlip } from "./CardFlip";

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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <CardFlip staff={staff} qrSrc={qrSrc} />

      <div className="hidden print:flex print:flex-col print:gap-4">
        <BusinessCardFront staff={staff} />
        <BusinessCardBack staff={staff} qrSrc={qrSrc} />
      </div>

      <p className="text-sm text-neutral-500 print:hidden">Touchez la carte pour la retourner</p>

      <a
        href={`/c/${staff.slug}/vcard`}
        className="print:hidden inline-flex items-center gap-2 rounded-full bg-ci-green px-6 py-3 text-white font-medium shadow hover:bg-ci-green-dark transition-colors"
      >
        Enregistrer le contact
      </a>
    </main>
  );
}
