import Image from "next/image";
import type { Staff } from "@/lib/staff";
import { isBadgeValid } from "@/lib/staff";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function Badge({
  staff,
  photoSrc,
  qrSrc,
}: {
  staff: Staff;
  photoSrc: string | null;
  qrSrc: string;
}) {
  const valid = isBadgeValid(staff);

  return (
    <div className="w-[54mm] h-[85.6mm] max-w-full aspect-[54/85.6] rounded-[3mm] bg-white text-black shadow-lg ring-1 ring-black/10 flex flex-col overflow-hidden print:shadow-none print:ring-0">
      <div className="bg-gradient-to-b from-ci-green to-ci-green-dark text-white px-[2.5mm] py-[1.8mm] flex items-center gap-[1.5mm] shrink-0">
        <Image
          src="/armoiries.png"
          alt="Armoiries de Côte d'Ivoire"
          width={40}
          height={40}
          className="h-[6mm] w-auto object-contain shrink-0"
        />
        <p className="min-w-0 flex-1 text-center font-serif text-[1.9mm] font-semibold leading-[1.15] line-clamp-2">
          {staff.institution}
        </p>
      </div>

      <div className="flex h-[1.8mm] shrink-0">
        <div className="flex-1 bg-ci-orange" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-ci-green" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center px-[3mm] py-[2mm] text-center overflow-hidden">
        <div className="w-[20.2mm] h-[26mm] rounded-[2mm] border-[0.6mm] border-ci-green overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt={staff.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[2mm] text-neutral-400">Photo</span>
          )}
        </div>

        <p className="font-serif text-[3mm] font-bold uppercase leading-tight mt-[3mm] line-clamp-2">
          {staff.full_name}
        </p>
        <p className="text-[2.3mm] text-ci-green-dark leading-tight mt-[0.5mm] line-clamp-2">
          {staff.function_title}
        </p>

        <div className="mt-[1.4mm] w-full text-[1.9mm] leading-snug text-neutral-700 space-y-[0.5mm]">
          <p className="truncate">
            <span className="font-bold">Matricule :</span> {staff.matricule}
          </p>
          <p className="truncate">
            <span className="font-bold">Institution :</span> {staff.institution}
          </p>
          <p className="truncate">
            <span className="font-bold">Valide jusqu&apos;au :</span> {formatDate(staff.valid_until)}
          </p>
        </div>

        {!valid && (
          <p className="mt-[1.5mm] text-[2mm] font-semibold text-red-600 uppercase shrink-0">Badge invalide</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-[1mm] px-[3mm] pb-[2.5mm] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt={`QR code de vérification du badge ${staff.matricule}`} className="h-[13mm] w-auto" />
        <p className="text-[1.6mm] text-neutral-500 text-center leading-tight">
          Scanner pour vérifier l&apos;authenticité
        </p>
      </div>
    </div>
  );
}
