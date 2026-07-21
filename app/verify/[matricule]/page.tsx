import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getDb, getVerifyMode } from "@/lib/db";
import { getStaffByMatricule, isBadgeValid } from "@/lib/staff";

type Params = Promise<{ matricule: string }>;

export const metadata: Metadata = { title: "Vérification de badge — AMBACI Vienne" };

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function VerifyPage({ params }: { params: Params }) {
  const { matricule } = await params;
  const staff = await getStaffByMatricule(getDb(), matricule);
  if (!staff) notFound();

  const valid = isBadgeValid(staff);
  const mode = getVerifyMode();
  const validUntil = formatDate(staff.valid_until);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
      <Image src="/armoiries.png" alt="Armoiries de Côte d'Ivoire" width={72} height={72} className="h-16 w-auto" />

      <div
        className={`w-full max-w-sm rounded-2xl p-6 text-white shadow-lg ${
          valid ? "bg-ci-green" : "bg-red-600"
        }`}
      >
        <p className="text-lg font-semibold">
          {valid ? "Membre du personnel authentique" : "Badge non valide"}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {valid
            ? validUntil
              ? `Valide jusqu'au ${validUntil}`
              : "Validité permanente"
            : "Ce badge a été désactivé ou a expiré"}
        </p>
      </div>

      {mode === "full" && (
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg text-left space-y-2">
          {staff.photo_key && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/photo/${staff.photo_key}`}
              alt={staff.full_name}
              className="w-24 h-24 rounded-lg object-cover mx-auto mb-3"
            />
          )}
          <p className="font-serif text-xl font-bold text-center">{staff.full_name}</p>
          <p className="text-ci-green-dark text-center">{staff.function_title}</p>
          <div className="text-sm text-neutral-600 pt-2 border-t border-neutral-200 space-y-1">
            <p>
              <span className="font-semibold">Matricule :</span> {staff.matricule}
            </p>
            <p>
              <span className="font-semibold">Institution :</span> {staff.institution}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400">Ambassade / Mission permanente de Côte d&apos;Ivoire - Vienne</p>
    </main>
  );
}
