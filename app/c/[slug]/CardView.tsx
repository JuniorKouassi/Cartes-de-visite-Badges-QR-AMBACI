"use client";

import { useEffect, useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import { BusinessCardFront, BusinessCardBack } from "@/components/BusinessCard";
import { cardStrings, type Lang } from "@/lib/i18n";
import type { Staff } from "@/lib/staff";

const LANG_STORAGE_KEY = "ambaci-card-lang";

export function CardView({ staff, qrSrc }: { staff: Staff; qrSrc: string }) {
  const [lang, setLang] = useState<Lang>("fr");
  const [flipped, setFlipped] = useState(false);
  const [exporting, setExporting] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  function changeLang(next: Lang) {
    setLang(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  }

  async function handleDownload(format: "png" | "jpeg") {
    const node = flipped ? backRef.current : frontRef.current;
    if (!node) return;

    setExporting(true);
    try {
      const dataUrl =
        format === "png"
          ? await toPng(node, { pixelRatio: 3 })
          : await toJpeg(node, { pixelRatio: 3, backgroundColor: "#ffffff", quality: 0.95 });

      const link = document.createElement("a");
      const side = flipped ? "verso" : "recto";
      link.download = `${staff.slug}-carte-${side}.${format === "png" ? "png" : "jpg"}`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const t = cardStrings[lang];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-1 rounded-full bg-white/90 backdrop-blur-sm p-1 shadow-lg ring-1 ring-black/10 print:hidden">
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

      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-label="Flip card"
        className="[perspective:1200px] cursor-pointer print:hidden"
      >
        <div
          className="relative w-[85.6mm] max-w-full aspect-[85.6/54] transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div ref={frontRef}>
              <BusinessCardFront staff={staff} lang={lang} />
            </div>
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div ref={backRef}>
              <BusinessCardBack staff={staff} qrSrc={qrSrc} lang={lang} />
            </div>
          </div>
        </div>
      </button>

      <div className="hidden print:flex print:flex-col print:gap-4">
        <BusinessCardFront staff={staff} lang={lang} />
        <BusinessCardBack staff={staff} qrSrc={qrSrc} lang={lang} />
      </div>

      <p className="text-sm text-white/90 drop-shadow-sm print:hidden">{t.flipHint}</p>

      <div className="print:hidden flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-lg ring-1 ring-black/10">
        <a
          href={`/c/${staff.slug}/vcard`}
          className="inline-flex items-center gap-2 rounded-full bg-ci-green px-6 py-3 text-white font-medium shadow hover:bg-ci-green-dark transition-colors"
        >
          {t.saveContact}
        </a>

        <div className="flex gap-4 text-sm">
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleDownload("png")}
            className="text-ci-green-dark hover:underline disabled:opacity-50"
          >
            {t.downloadPng}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleDownload("jpeg")}
            className="text-ci-green-dark hover:underline disabled:opacity-50"
          >
            {t.downloadJpeg}
          </button>
        </div>
      </div>
    </div>
  );
}
