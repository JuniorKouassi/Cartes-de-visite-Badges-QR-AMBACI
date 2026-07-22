import Image from "next/image";
import { localizedFunctionTitle, localizedInstitution, type Staff } from "@/lib/staff";
import { cardStrings, type Lang } from "@/lib/i18n";
import { ebGaramond } from "@/lib/fonts";

const cardSizing = "w-[85.6mm] h-[54mm] max-w-full aspect-[85.6/54]";

export function BusinessCardFront({ staff, lang = "fr" }: { staff: Staff; lang?: Lang }) {
  const t = cardStrings[lang];
  const institution = localizedInstitution(staff, lang);
  const functionTitle = localizedFunctionTitle(staff, lang);

  return (
    <div
      className={`${cardSizing} ${ebGaramond.className} relative bg-card-cream text-navy-line shadow-lg ring-1 ring-black/10 overflow-hidden print:shadow-none print:ring-0`}
    >
      <div className="absolute" style={{ left: "4.531%", top: "6.373%", width: "27.5%", height: "39.216%" }}>
        <Image
          src="/armoiries.png"
          alt="Armoiries de Côte d'Ivoire"
          fill
          sizes="30vw"
          className="object-contain object-left-top"
        />
      </div>

      <div className="absolute text-center" style={{ left: "51.172%", top: "12.01%", width: "36.719%" }}>
        <p className="text-navy font-medium leading-[1.32] line-clamp-2" style={{ fontSize: "2.07mm" }}>
          {institution}
        </p>
        <div className="flex mt-[0.94mm]" style={{ height: "0.67mm" }}>
          <div className="flex-1 bg-ci-orange" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-ci-green" />
        </div>
      </div>

      <div className="absolute text-center" style={{ left: "51.172%", top: "35.294%", width: "36.719%" }}>
        <p className="text-navy-deep font-bold truncate" style={{ fontSize: "2.94mm" }}>
          {staff.full_name}
        </p>
        <p
          className="text-navy italic font-medium mt-[1.07mm] leading-tight line-clamp-2"
          style={{ fontSize: "2.21mm" }}
        >
          {functionTitle}
        </p>
      </div>

      <div
        className="absolute border-t border-navy-line"
        style={{ left: "3.906%", right: "3.906%", bottom: "28.922%" }}
      />

      <div className="absolute leading-[1.44]" style={{ left: "3.906%", bottom: "7.108%", fontSize: "2.14mm" }}>
        <p>{t.addressLine1}</p>
        <p>{t.addressLine2}</p>
        <p>{t.addressCountry}</p>
      </div>

      <div className="absolute" style={{ left: "51.172%", width: "36.719%", bottom: "7.108%", fontSize: "2.14mm" }}>
        <div className="grid grid-cols-[auto_auto] gap-x-[1.74mm] gap-y-[0.2mm] w-fit mx-auto leading-[1.44]">
          {staff.phone_office && (
            <>
              <span>{t.tel}:</span>
              <a href={`tel:${staff.phone_office.replace(/\s+/g, "")}`} className="hover:underline">
                {staff.phone_office}
              </a>
            </>
          )}
          {staff.phone_cell && (
            <>
              <span>{t.cel}:</span>
              <a href={`tel:${staff.phone_cell.replace(/\s+/g, "")}`} className="hover:underline">
                {staff.phone_cell}
              </a>
            </>
          )}
          {staff.email && (
            <>
              <span>{t.email}:</span>
              <a href={`mailto:${staff.email}`} className="hover:underline">
                {staff.email}
              </a>
            </>
          )}
        </div>
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
      className={`${cardSizing} ${ebGaramond.className} bg-card-cream text-navy-line shadow-lg ring-1 ring-black/10 flex flex-col items-center justify-center gap-[1.5mm] p-[3.5mm] overflow-hidden print:shadow-none print:ring-0`}
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
      <p className="text-navy-deep font-semibold text-center leading-tight line-clamp-1 max-w-full px-[2mm]" style={{ fontSize: "2.4mm" }}>
        {staff.full_name}
      </p>
      <p className="text-navy text-center leading-tight shrink-0" style={{ fontSize: "1.9mm" }}>
        {t.scanForCard}
      </p>
    </div>
  );
}
