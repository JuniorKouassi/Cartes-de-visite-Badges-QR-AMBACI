import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { getConsularHolderByCardNumber, isConsularCardValid } from "@/lib/consularHolders";

export const metadata: Metadata = { title: "Vérification de carte consulaire — AMBACI Vienne" };

type Params = Promise<{ cardNumber: string }>;

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function VerifyConsularPage({ params }: { params: Params }) {
  const { cardNumber } = await params;
  const holder = await getConsularHolderByCardNumber(getDb(), cardNumber);
  if (!holder) notFound();

  const valid = isConsularCardValid(holder);
  const validUntil = formatDate(holder.card_valid_until);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution source for crisp rendering */}
      <img src="/armoiries.png" alt="Armoiries de Côte d'Ivoire" className="h-16 w-auto" />

      {holder.photo_key && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/photo/${holder.photo_key}`}
          alt={`${holder.first_names} ${holder.last_name}`}
          className={`w-44 h-44 rounded-full object-cover shadow-lg ring-4 ${valid ? "ring-ci-green" : "ring-red-600"}`}
        />
      )}

      <div className={`w-full max-w-sm rounded-2xl p-6 text-white shadow-lg ${valid ? "bg-ci-green" : "bg-red-600"}`}>
        <p className="text-lg font-semibold">{valid ? "Carte consulaire authentique" : "Carte non valide"}</p>
        <p className="mt-1 text-sm opacity-90">
          {valid
            ? validUntil
              ? `Valide jusqu'au ${validUntil}`
              : "Validité permanente"
            : "Cette carte a été désactivée ou a expiré"}
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg text-left space-y-2">
        <p className="font-serif text-xl font-bold text-center">
          {holder.first_names} {holder.last_name}
        </p>
        {holder.country_of_residence && (
          <p className="text-ci-green-dark text-center">Résident(e) en {holder.country_of_residence}</p>
        )}
        <div className="text-sm text-neutral-600 pt-2 border-t border-neutral-200 space-y-1">
          <p>
            <span className="font-semibold">N° de carte :</span> {holder.card_number}
          </p>
          {holder.date_of_birth && (
            <p>
              <span className="font-semibold">Date de naissance :</span> {formatDate(holder.date_of_birth)}
            </p>
          )}
          {holder.passport_number && (
            <p>
              <span className="font-semibold">Passeport :</span> {holder.passport_number}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-400">Ambassade / Mission permanente de Côte d&apos;Ivoire - Autriche</p>
    </main>
  );
}
