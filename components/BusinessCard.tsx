import Image from "next/image";
import type { Staff } from "@/lib/staff";

const cardSizing = "w-[85.6mm] h-[54mm] max-w-full aspect-[85.6/54]";

export function BusinessCardFront({ staff }: { staff: Staff }) {
  return (
    <div
      className={`${cardSizing} rounded-[3mm] bg-white text-black shadow-lg ring-1 ring-black/10 flex flex-col p-[4mm] print:shadow-none print:ring-0`}
    >
      <div className="flex items-start gap-[2mm]">
        <Image
          src="/armoiries.png"
          alt="Armoiries de Côte d'Ivoire"
          width={64}
          height={64}
          className="w-[14%] h-auto shrink-0"
        />
        <div className="flex-1 text-center">
          <p className="font-serif text-[3.1mm] font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {staff.institution}
          </p>
          <p className="text-[2.3mm] font-bold tracking-wide leading-tight mt-[0.5mm]">
            RÉPUBLIQUE DE CÔTE D&apos;IVOIRE
          </p>
          <p className="text-[1.9mm] text-neutral-500 leading-tight">Union – Discipline – Travail</p>
        </div>
        <div className="w-[14%] shrink-0" aria-hidden />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="font-serif text-[4.4mm] font-bold uppercase tracking-wide leading-tight">
          {staff.full_name}
        </p>
        <p className="text-[3mm] text-ci-green-dark mt-[1mm]">{staff.function_title}</p>
      </div>

      <div className="border-t border-black pt-[1.5mm] text-[2.4mm] leading-snug">
        <p>
          {staff.phone_office && (
            <a href={`tel:${staff.phone_office.replace(/\s+/g, "")}`} className="hover:underline">
              Tél.: {staff.phone_office}
            </a>
          )}
          {staff.phone_office && staff.phone_cell && " – "}
          {staff.phone_cell && (
            <a href={`tel:${staff.phone_cell.replace(/\s+/g, "")}`} className="hover:underline">
              Cel : {staff.phone_cell}
            </a>
          )}
        </p>
        {staff.email && (
          <p>
            E-mail :{" "}
            <a href={`mailto:${staff.email}`} className="hover:underline">
              {staff.email}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export function BusinessCardBack({ staff, qrSrc }: { staff: Staff; qrSrc: string }) {
  return (
    <div
      className={`${cardSizing} rounded-[3mm] bg-white text-black shadow-lg ring-1 ring-black/10 flex flex-col items-center justify-center gap-[2mm] p-[4mm] print:shadow-none print:ring-0`}
    >
      <Image src="/armoiries.png" alt="Armoiries de Côte d'Ivoire" width={40} height={40} className="h-[7mm] w-auto" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrSrc} alt={`QR code de la carte de visite de ${staff.full_name}`} className="h-[58%] w-auto" />
      <p className="font-serif text-[2.6mm] font-semibold text-center leading-tight">{staff.full_name}</p>
      <p className="text-[2.1mm] text-neutral-500 text-center leading-tight">
        Scannez pour ma carte de visite
      </p>
    </div>
  );
}
