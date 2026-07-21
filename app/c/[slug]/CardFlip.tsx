"use client";

import { useState } from "react";
import { BusinessCardFront, BusinessCardBack } from "@/components/BusinessCard";
import type { Staff } from "@/lib/staff";

export function CardFlip({ staff, qrSrc }: { staff: Staff; qrSrc: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      aria-label="Retourner la carte de visite"
      className="[perspective:1200px] cursor-pointer print:hidden"
    >
      <div
        className="relative w-[85.6mm] max-w-full aspect-[85.6/54] transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <BusinessCardFront staff={staff} />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <BusinessCardBack staff={staff} qrSrc={qrSrc} />
        </div>
      </div>
    </button>
  );
}
