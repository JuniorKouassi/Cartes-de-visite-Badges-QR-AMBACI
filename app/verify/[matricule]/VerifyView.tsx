"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { dateLocale, verifyStrings, type Lang } from "@/lib/i18n";
import { localizedFunctionTitle, localizedInstitution, type Staff } from "@/lib/staff";

const LANG_STORAGE_KEY = "ambaci-card-lang";

function formatDate(value: string | null, lang: Lang) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(dateLocale[lang], { year: "numeric", month: "long", day: "numeric" });
}

export function VerifyView({
  staff,
  valid,
  mode,
}: {
  staff: Staff;
  valid: boolean;
  mode: "minimal" | "full";
}) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  function changeLang(next: Lang) {
    setLang(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  }

  const t = verifyStrings[lang];
  const validUntil = formatDate(staff.valid_until, lang);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
      <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/10">
        {(
          [
            { code: "fr", flag: "🇫🇷" },
            { code: "en", flag: "🇬🇧" },
          ] as const
        ).map(({ code, flag }) => (
          <button
            key={code}
            type="button"
            onClick={() => changeLang(code)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              lang === code ? "bg-ci-green text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span className="text-base leading-none">{flag}</span>
            {code.toUpperCase()}
          </button>
        ))}
      </div>

      <Image src="/armoiries.png" alt="Armoiries de Côte d'Ivoire" width={72} height={72} className="h-16 w-auto" />

      {staff.photo_key && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/photo/${staff.photo_key}`}
          alt={staff.full_name}
          className={`w-44 h-44 rounded-full object-cover shadow-lg ring-4 ${
            valid ? "ring-ci-green" : "ring-red-600"
          }`}
        />
      )}

      <div
        className={`w-full max-w-sm rounded-2xl p-6 text-white shadow-lg ${
          valid ? "bg-ci-green" : "bg-red-600"
        }`}
      >
        <p className="text-lg font-semibold">{valid ? t.authentic : t.invalid}</p>
        <p className="mt-1 text-sm opacity-90">
          {valid ? (validUntil ? `${t.validUntil} ${validUntil}` : t.permanentValidity) : t.invalidReason}
        </p>
      </div>

      {mode === "full" && (
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg text-left space-y-2">
          <p className="font-serif text-xl font-bold text-center">{staff.full_name}</p>
          <p className="text-ci-green-dark text-center">{localizedFunctionTitle(staff, lang)}</p>
          <div className="text-sm text-neutral-600 pt-2 border-t border-neutral-200 space-y-1">
            <p>
              <span className="font-semibold">{t.matricule} :</span> {staff.matricule}
            </p>
            <p>
              <span className="font-semibold">{t.institution} :</span> {localizedInstitution(staff, lang)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400">{t.footer}</p>
    </main>
  );
}
