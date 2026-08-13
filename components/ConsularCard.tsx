import type { ConsularHolder } from "@/lib/consularHolders";
import { archivo, archivoNarrow, dmSans, dancingScript } from "@/lib/fonts";

const AMBASSADOR_NAME = "Yacouba Cissé";
const cardSizing = "w-[85.6mm] h-[54mm] max-w-full aspect-[85.6/54]";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function Field({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-[0.25mm] ${wide ? "col-span-2" : ""}`}>
      <span
        className={`${archivoNarrow.className} font-semibold uppercase text-[#0E8F47]`}
        style={{ fontSize: "0.89mm", letterSpacing: "0.13em" }}
      >
        {label}
      </span>
      <span className={`${dmSans.className} font-semibold text-[#1d1a16] leading-tight truncate`} style={{ fontSize: "1.48mm" }}>
        {value}
      </span>
    </div>
  );
}

export function ConsularCardFront({ holder, photoSrc }: { holder: ConsularHolder; photoSrc: string | null }) {
  const validity =
    holder.card_valid_from || holder.card_valid_until
      ? `${formatDate(holder.card_valid_from)} au ${formatDate(holder.card_valid_until)}`
      : "—";

  return (
    <div
      className={`${cardSizing} relative overflow-hidden rounded-[2.5mm] bg-white text-[#1d1a16] shadow-lg ring-1 ring-black/10 print:shadow-none print:ring-0`}
    >
      {/* header */}
      <div
        className="relative flex items-center justify-between text-white"
        style={{ height: "10.32mm", padding: "0 2.71mm", background: "linear-gradient(100deg,#F58A0B 0%,#EC7A07 44%,#1FA85A 100%)" }}
      >
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: "5.08mm", background: "linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))" }}
        />
        <div className="relative flex items-center" style={{ gap: "1.35mm" }}>
          <div
            className="flex-none rounded-full bg-white flex items-center justify-center shadow"
            style={{ width: "6.26mm", height: "6.26mm" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- crisp print export */}
            <img src="/armoiries.png" alt="Armoiries de Côte d'Ivoire" style={{ height: "5.15mm", width: "5.15mm" }} className="object-contain" />
          </div>
          <div className="flex flex-col" style={{ gap: "0.34mm" }}>
            <div className={`${archivo.className} font-extrabold leading-none`} style={{ fontSize: "1.61mm" }}>
              RÉPUBLIQUE DE CÔTE D&apos;IVOIRE
            </div>
            <div
              className={`${archivoNarrow.className} font-semibold uppercase`}
              style={{ fontSize: "0.97mm", letterSpacing: "0.2em", color: "rgba(255,255,255,0.9)" }}
            >
              Union · Discipline · Travail
            </div>
          </div>
        </div>
        <div className="relative text-right">
          <div className={`${archivo.className} font-black leading-none`} style={{ fontSize: "2.12mm" }}>
            CARTE CONSULAIRE
          </div>
          <div
            className={`${archivoNarrow.className} font-semibold uppercase`}
            style={{ fontSize: "0.97mm", letterSpacing: "0.16em", color: "rgba(255,255,255,0.92)", marginTop: "0.51mm" }}
          >
            Ambassade à Vienne · Autriche
          </div>
        </div>
      </div>

      {/* body */}
      <div className="relative flex" style={{ height: "43.15mm", padding: "2.03mm 2.54mm 1.86mm", gap: "2.37mm" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/consular-elephant.png"
          alt=""
          className="absolute pointer-events-none"
          style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "32.15mm", height: "auto", opacity: 0.14 }}
        />

        {/* left column */}
        <div className="relative flex-none flex flex-col" style={{ width: "18.79mm" }}>
          <div
            className="self-start bg-white rounded-[1.18mm] shadow"
            style={{ padding: "0.42mm", border: "0.17mm solid #E7B85F" }}
          >
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt={`${holder.first_names} ${holder.last_name}`}
                className="block object-cover rounded-[0.76mm]"
                style={{ width: "17.1mm", height: "20.98mm" }}
              />
            ) : (
              <div
                className="flex items-center justify-center bg-neutral-100 rounded-[0.76mm] text-neutral-400"
                style={{ width: "17.1mm", height: "20.98mm", fontSize: "1.6mm" }}
              >
                Photo
              </div>
            )}
          </div>

          <div
            className="self-center inline-flex items-center rounded-[0.76mm] text-white"
            style={{ marginTop: "0.93mm", gap: "0.68mm", background: "#0E8F47", padding: "0.59mm 1.1mm" }}
          >
            <span
              className={`${archivoNarrow.className} font-bold uppercase`}
              style={{ fontSize: "0.85mm", letterSpacing: "0.14em", color: "#A7F0C6" }}
            >
              N°
            </span>
            <span
              className="font-semibold"
              style={{ fontFamily: "ui-monospace, monospace", fontSize: "1.18mm", letterSpacing: "0.04em" }}
            >
              {holder.card_number}
            </span>
          </div>

          <div className="flex-1" />

          <div className="flex items-end" style={{ gap: "1.18mm" }}>
            <div
              className="relative flex-none rounded-full flex flex-col items-center justify-center"
              style={{
                width: "7.45mm",
                height: "7.45mm",
                border: "0.21mm solid rgba(27,63,174,0.75)",
                transform: "rotate(-8deg)",
                color: "rgba(27,63,174,0.8)",
              }}
            >
              <div className="absolute rounded-full" style={{ inset: "0.51mm", border: "0.08mm solid rgba(27,63,174,0.55)" }} />
              <div style={{ fontSize: "0.93mm", lineHeight: 1 }}>★</div>
              <div className={`${archivo.className} font-extrabold`} style={{ fontSize: "0.76mm", letterSpacing: "0.06em", marginTop: "0.17mm" }}>
                AMBASSADE
              </div>
              <div className={`${archivo.className} font-bold`} style={{ fontSize: "0.59mm", letterSpacing: "0.04em" }}>
                CÔTE D&apos;IVOIRE
              </div>
              <div className={`${archivoNarrow.className} font-semibold`} style={{ fontSize: "0.68mm", letterSpacing: "0.18em", marginTop: "0.17mm" }}>
                VIENNE
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`${dancingScript.className} font-bold leading-none whitespace-nowrap`}
                style={{ fontSize: "2.54mm", color: "#1B3FAE", transform: "rotate(-5deg)", transformOrigin: "left bottom" }}
              >
                {AMBASSADOR_NAME}
              </div>
              <div
                className={`${archivoNarrow.className} font-semibold uppercase`}
                style={{
                  borderTop: "0.08mm solid #d9cdb2",
                  marginTop: "0.68mm",
                  paddingTop: "0.42mm",
                  fontSize: "0.85mm",
                  letterSpacing: "0.16em",
                  color: "#7a7363",
                }}
              >
                L&apos;Ambassadeur
              </div>
            </div>
          </div>
        </div>

        {/* fields */}
        <div className="relative flex-1 grid grid-cols-2 content-start" style={{ columnGap: "2.54mm", rowGap: "1.44mm" }}>
          <Field label="Nom" value={holder.last_name} />
          <Field label="Prénoms" value={holder.first_names} />
          <Field label="Date de naissance" value={formatDate(holder.date_of_birth)} />
          <Field label="Lieu de naissance" value={holder.place_of_birth || "—"} />
          <Field label="Sexe" value={holder.sex || "—"} />
          <Field label="Pays de résidence" value={holder.country_of_residence || "—"} />
          <Field label="Profession" value={holder.profession || "—"} />
          <Field label="Téléphone" value={holder.phone || "—"} />
          <Field label="Adresse" value={holder.address || "—"} wide />
          <Field label="Validité" value={validity} wide />
        </div>
      </div>

      <div className="absolute flex flex-col items-center" style={{ right: "2.2mm", bottom: "1.69mm", gap: "0.42mm" }}>
        <div className="bg-white rounded-[0.85mm] shadow" style={{ border: "0.08mm solid #e2d8c4", padding: "0.59mm", lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/consular-portal-qr.jpg" alt="QR code du portail AMBACI Vienne" style={{ width: "9.48mm", height: "9.48mm", display: "block" }} />
        </div>
        <span
          className={`${archivoNarrow.className} font-semibold uppercase`}
          style={{ fontSize: "0.72mm", letterSpacing: "0.12em", color: "#7a7363" }}
        >
          Scannez le QR code
        </span>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.51mm", background: "linear-gradient(90deg,#F58A0B,#EC7A07,#1FA85A)" }}
      />
    </div>
  );
}

export function ConsularCardBack({ holder }: { holder: ConsularHolder }) {
  return (
    <div
      className={`${cardSizing} relative overflow-hidden rounded-[2.5mm] text-white shadow-lg ring-1 ring-black/10 print:shadow-none print:ring-0`}
      style={{ background: "linear-gradient(125deg,#F58A0B 0%,#E8881A 40%,#11924D 100%)" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(110% 80% at 18% 12%, rgba(255,224,150,0.35), rgba(255,224,150,0) 55%)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/consular-elephant.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "54%",
          transform: "translate(-50%,-50%)",
          width: "35.5mm",
          height: "auto",
          opacity: 0.12,
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative h-full flex flex-col justify-between" style={{ padding: "3.21mm 3.72mm" }}>
        <div className="flex items-center" style={{ gap: "1.35mm" }}>
          <div
            className="flex-none rounded-full bg-white flex items-center justify-center shadow"
            style={{ width: "5.75mm", height: "5.75mm" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/armoiries.png" alt="Armoiries de Côte d'Ivoire" style={{ height: "5.58mm", width: "5.58mm" }} className="object-contain" />
          </div>
          <div>
            <div className={`${archivo.className} font-extrabold`} style={{ fontSize: "1.61mm" }}>
              RÉPUBLIQUE DE CÔTE D&apos;IVOIRE
            </div>
            <div
              className={`${archivoNarrow.className} font-semibold uppercase`}
              style={{ fontSize: "1.02mm", letterSpacing: "0.16em", color: "rgba(255,255,255,0.9)", marginTop: "0.34mm" }}
            >
              Ambassade à Vienne · Autriche
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.18mm] shadow" style={{ padding: "1.52mm 2.2mm" }}>
          <div
            style={{
              height: "6.6mm",
              width: "100%",
              background:
                "repeating-linear-gradient(90deg,#141414 0,#141414 0.17mm,#fff 0.17mm,#fff 0.34mm,#141414 0.34mm,#141414 0.59mm,#fff 0.59mm,#fff 0.68mm,#141414 0.68mm,#141414 0.85mm,#fff 0.85mm,#fff 1.1mm,#141414 1.1mm,#141414 1.18mm,#fff 1.18mm,#fff 1.35mm,#141414 1.35mm,#141414 1.61mm,#fff 1.61mm,#fff 1.78mm,#141414 1.78mm,#141414 1.86mm,#fff 1.86mm,#fff 2.12mm,#141414 2.12mm,#141414 2.37mm,#fff 2.37mm,#fff 2.45mm,#141414 2.45mm,#141414 2.62mm,#fff 2.62mm,#fff 2.88mm)",
            }}
          />
          <div
            className="text-center"
            style={{
              marginTop: "0.85mm",
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.34em",
              fontSize: "1.35mm",
              fontWeight: 600,
              color: "#141414",
            }}
          >
            {holder.card_number}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex rounded-[0.42mm] overflow-hidden shadow" style={{ width: "6.77mm", height: "4.57mm" }}>
              <div className="flex-1" style={{ background: "#F77F00" }} />
              <div className="flex-1 bg-white" />
              <div className="flex-1" style={{ background: "#009E60" }} />
            </div>
            <div
              className={`${archivoNarrow.className} font-semibold uppercase`}
              style={{ fontSize: "0.89mm", letterSpacing: "0.1em", marginTop: "0.59mm", color: "rgba(255,255,255,0.92)" }}
            >
              Côte d&apos;Ivoire
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-col rounded-[0.42mm] overflow-hidden shadow" style={{ width: "6.77mm", height: "4.57mm" }}>
              <div className="flex-1" style={{ background: "#C8102E" }} />
              <div className="flex-1 bg-white" />
              <div className="flex-1" style={{ background: "#C8102E" }} />
            </div>
            <div
              className={`${archivoNarrow.className} font-semibold uppercase text-center`}
              style={{ fontSize: "0.89mm", letterSpacing: "0.1em", marginTop: "0.59mm", color: "rgba(255,255,255,0.92)" }}
            >
              Autriche
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
