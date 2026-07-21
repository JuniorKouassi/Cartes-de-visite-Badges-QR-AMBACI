import Image from "next/image";
import type { Staff } from "@/lib/staff";
import { cardStrings, type Lang } from "@/lib/i18n";

const cardSizing = "w-[85.6mm] h-[54mm] max-w-full aspect-[85.6/54]";

export function BusinessCardFront({ staff, lang = "fr" }: { staff: Staff; lang?: Lang }) {
  const t = cardStrings[lang];

  return (
    <div
      className={`${cardSizing} rounded-[3mm] bg-white text-black shadow-lg ring-1 ring-black/10 flex flex-col p-[3.5mm] overflow-hidden print:shadow-none print:ring-0`}
    >
      <div className="flex items-start gap-[1.5mm] shrink-0">
        <Image
          src="/armoiries.png"
          alt="Armoiries de Côte d'Ivoire"
          width={64}
          height={64}
          className="w-[13%] max-h-[8mm] h-auto object-contain shrink-0"
        />
        <div className="flex-1 min-w-0 text-center">
          <p className="font-serif text-[2.6mm] font-semibold leading-tight truncate">{staff.institution}</p>
          <p className="text-[2mm] font-bold tracking-wide leading-tight mt-[0.4mm] truncate">{t.republic}</p>
          <p className="text-[1.7mm] text-neutral-500 leading-tight truncate">{t.motto}</p>
        </div>
        <div className="w-[13%] shrink-0" aria-hidden />
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-[1mm] py-[1mm] overflow-hidden">
        <p className="font-serif text-[3.6mm] font-bold uppercase tracking-wide leading-tight line-clamp-2">
          {staff.full_name}
        </p>
        <p className="text-[2.6mm] text-ci-green-dark mt-[0.8mm] leading-tight line-clamp-2">
          {staff.function_title}
        </p>
      </div>

      <div className="border-t border-black pt-[1mm] text-[2.1mm] leading-snug shrink-0">
        <p className="truncate">
          {staff.phone_office && (
            <a href={`tel:${staff.phone_office.replace(/\s+/g, "")}`} className="hover:underline">
              {t.tel}: {staff.phone_office}
            </a>
          )}
          {staff.phone_office && staff.phone_cell && " – "}
          {staff.phone_cell && (
            <a href={`tel:${staff.phone_cell.replace(/\s+/g, "")}`} className="hover:underline">
              {t.cel} : {staff.phone_cell}
            </a>
          )}
        </p>
        {staff.email && (
          <p className="truncate">
            {t.email} :{" "}
            <a href={`mailto:${staff.email}`} className="hover:underline">
              {staff.email}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export function BusinessCardBack({
  staff,
  qrSrc,
  lang = "fr",
}: {
  staff: Staff;
  qrSrc: string;
  lang?: Lang;
}) {
  const t = cardStrings[lang];

  return (
    <div
      className={`${cardSizing} rounded-[3mm] bg-white text-black shadow-lg ring-1 ring-black/10 flex flex-col items-center justify-center gap-[1.5mm] p-[3.5mm] overflow-hidden print:shadow-none print:ring-0`}
    >
      <Image
        src="/armoiries.png"
        alt="Armoiries de Côte d'Ivoire"
        width={40}
        height={40}
        className="h-[6mm] w-auto object-contain shrink-0"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrSrc}
        alt={`QR code de la carte de visite de ${staff.full_name}`}
        className="h-[52%] w-auto shrink-0"
      />
      <p className="font-serif text-[2.4mm] font-semibold text-center leading-tight line-clamp-1 max-w-full px-[2mm]">
        {staff.full_name}
      </p>
      <p className="text-[1.9mm] text-neutral-500 text-center leading-tight shrink-0">{t.scanForCard}</p>
    </div>
  );
}
