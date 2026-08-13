"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { ConsularCardFront, ConsularCardBack } from "@/components/ConsularCard";
import type { ConsularHolder } from "@/lib/consularHolders";

const EXPORT_PIXEL_RATIO = 6;
const CARD_MM = { w: 85.6, h: 54 };

type FormState = {
  last_name: string;
  first_names: string;
  date_of_birth: string;
  place_of_birth: string;
  sex: string;
  country_of_residence: string;
  profession: string;
  phone: string;
  address: string;
  card_valid_from: string;
  card_valid_until: string;
  passport_number: string;
  passport_issued_at: string;
  passport_expires_at: string;
  passport_issuing_authority: string;
  active: boolean;
  card_number: string;
};

function toFormState(holder?: ConsularHolder): FormState {
  return {
    last_name: holder?.last_name ?? "",
    first_names: holder?.first_names ?? "",
    date_of_birth: holder?.date_of_birth ?? "",
    place_of_birth: holder?.place_of_birth ?? "",
    sex: holder?.sex ?? "",
    country_of_residence: holder?.country_of_residence ?? "Autriche",
    profession: holder?.profession ?? "",
    phone: holder?.phone ?? "",
    address: holder?.address ?? "",
    card_valid_from: holder?.card_valid_from ?? "",
    card_valid_until: holder?.card_valid_until ?? "",
    passport_number: holder?.passport_number ?? "",
    passport_issued_at: holder?.passport_issued_at ?? "",
    passport_expires_at: holder?.passport_expires_at ?? "",
    passport_issuing_authority: holder?.passport_issuing_authority ?? "",
    active: holder ? Boolean(holder.active) : true,
    card_number: holder?.card_number ?? "",
  };
}

export function ConsularHolderForm({ holder }: { holder?: ConsularHolder }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(holder));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<"front" | "back" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    };
  }, [pendingPhotoUrl]);

  useEffect(() => {
    if (!zoomed) return;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomed]);

  const [mobileZoomScale, setMobileZoomScale] = useState(1);
  useEffect(() => {
    if (!zoomed || typeof window === "undefined") return;

    function computeScale() {
      if (window.innerWidth >= 640) return;
      const MM_TO_PX = 3.7795;
      const naturalWidthPx = CARD_MM.w * MM_TO_PX;
      const naturalHeightPx = CARD_MM.h * MM_TO_PX;
      const availableWidth = window.innerWidth - 32;
      const availableHeight = window.innerHeight - 96;
      setMobileZoomScale(Math.max(0.5, Math.min(availableWidth / naturalWidthPx, availableHeight / naturalHeightPx)));
    }

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [zoomed]);

  const previewHolder: ConsularHolder = {
    id: holder?.id ?? 0,
    card_number: form.card_number || holder?.card_number || "APERÇU",
    last_name: form.last_name || "NOM",
    first_names: form.first_names || "Prénoms",
    date_of_birth: form.date_of_birth || null,
    place_of_birth: form.place_of_birth || null,
    sex: form.sex || null,
    country_of_residence: form.country_of_residence || null,
    profession: form.profession || null,
    phone: form.phone || null,
    address: form.address || null,
    card_valid_from: form.card_valid_from || null,
    card_valid_until: form.card_valid_until || null,
    passport_number: form.passport_number || null,
    passport_issued_at: form.passport_issued_at || null,
    passport_expires_at: form.passport_expires_at || null,
    passport_issuing_authority: form.passport_issuing_authority || null,
    photo_key: holder?.photo_key ?? null,
    active: form.active ? 1 : 0,
    created_at: holder?.created_at ?? "",
    updated_at: holder?.updated_at ?? "",
  };

  const photoSrc = pendingPhotoUrl ?? (holder?.photo_key ? `/api/photo/${holder.photo_key}` : null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      last_name: form.last_name,
      first_names: form.first_names,
      date_of_birth: form.date_of_birth || null,
      place_of_birth: form.place_of_birth || null,
      sex: form.sex || null,
      country_of_residence: form.country_of_residence || null,
      profession: form.profession || null,
      phone: form.phone || null,
      address: form.address || null,
      card_valid_from: form.card_valid_from || null,
      card_valid_until: form.card_valid_until || null,
      passport_number: form.passport_number || null,
      passport_issued_at: form.passport_issued_at || null,
      passport_expires_at: form.passport_expires_at || null,
      passport_issuing_authority: form.passport_issuing_authority || null,
      active: form.active,
      card_number: form.card_number || undefined,
    };

    try {
      const res = await fetch(holder ? `/api/consular/${holder.id}` : "/api/consular", {
        method: holder ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Échec de l'enregistrement");
      }
      const saved: ConsularHolder = await res.json();

      if (!holder) {
        if (pendingPhoto) await uploadPhoto(saved.id, pendingPhoto);
        router.push(`/admin/consulaire/cartes/${saved.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(id: number, file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("photo", file);
      const res = await fetch(`/api/consular/${id}/photo`, { method: "POST", body });
      if (!res.ok) throw new Error("Échec de l'envoi de la photo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!holder) return;
    if (
      !window.confirm(
        `Supprimer définitivement la fiche de ${holder.first_names} ${holder.last_name} ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/consular/${holder.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Échec de la suppression");
      router.push("/admin/consulaire/cartes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setDeleting(false);
    }
  }

  function handlePhotoSelect(file: File) {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    setPendingPhoto(file);
    setPendingPhotoUrl(URL.createObjectURL(file));

    if (holder) {
      void uploadPhoto(holder.id, file).then(() => router.refresh());
    }
  }

  async function captureDataUrl(node: HTMLElement, format: "png" | "jpeg") {
    return format === "png"
      ? toPng(node, { pixelRatio: EXPORT_PIXEL_RATIO })
      : toJpeg(node, { pixelRatio: EXPORT_PIXEL_RATIO, backgroundColor: "#ffffff", quality: 0.98 });
  }

  function triggerDownload(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  async function handleExportImage(key: "front" | "back", ref: RefObject<HTMLDivElement | null>, format: "png" | "jpeg") {
    if (!ref.current || !holder) return;
    setExportingKey(`${key}-${format}`);
    try {
      const dataUrl = await captureDataUrl(ref.current, format);
      triggerDownload(dataUrl, `${holder.card_number}-${key}.${format === "png" ? "png" : "jpg"}`);
    } finally {
      setExportingKey(null);
    }
  }

  async function handleExportPdf() {
    if (!holder || !frontRef.current || !backRef.current) return;
    setExportingKey("pdf");
    try {
      const [frontUrl, backUrl] = await Promise.all([
        captureDataUrl(frontRef.current, "png"),
        captureDataUrl(backRef.current, "png"),
      ]);

      const doc = new jsPDF({ unit: "mm", format: [CARD_MM.w, CARD_MM.h], orientation: "landscape" });
      doc.addImage(frontUrl, "PNG", 0, 0, CARD_MM.w, CARD_MM.h);
      doc.addPage([CARD_MM.w, CARD_MM.h], "landscape");
      doc.addImage(backUrl, "PNG", 0, 0, CARD_MM.w, CARD_MM.h);
      doc.save(`${holder.card_number}-carte-consulaire.pdf`);
    } finally {
      setExportingKey(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              required
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prénoms *</label>
            <input
              required
              value={form.first_names}
              onChange={(e) => update("first_names", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date de naissance</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update("date_of_birth", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lieu de naissance</label>
            <input
              value={form.place_of_birth}
              onChange={(e) => update("place_of_birth", e.target.value)}
              placeholder="Ville / Pays"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sexe</label>
            <select
              value={form.sex}
              onChange={(e) => update("sex", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            >
              <option value="">—</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pays de résidence</label>
            <input
              value={form.country_of_residence}
              onChange={(e) => update("country_of_residence", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profession</label>
            <input
              value={form.profession}
              onChange={(e) => update("profession", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de carte</label>
            <input
              value={form.card_number}
              onChange={(e) => update("card_number", e.target.value)}
              placeholder="Auto-généré si vide"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Validité du</label>
              <input
                type="date"
                value={form.card_valid_from}
                onChange={(e) => update("card_valid_from", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">au</label>
              <input
                type="date"
                value={form.card_valid_until}
                onChange={(e) => update("card_valid_until", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-ci-green focus:ring-ci-green"
          />
          Carte active
        </label>

        <div className="border-t border-neutral-100 pt-4">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Passeport</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Numéro de passeport</label>
              <input
                value={form.passport_number}
                onChange={(e) => update("passport_number", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Autorité de délivrance</label>
              <input
                value={form.passport_issuing_authority}
                onChange={(e) => update("passport_issuing_authority", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de délivrance</label>
              <input
                type="date"
                value={form.passport_issued_at}
                onChange={(e) => update("passport_issued_at", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date d&apos;expiration</label>
              <input
                type="date"
                value={form.passport_expires_at}
                onChange={(e) => update("passport_expires_at", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg border border-neutral-300 overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-neutral-400 text-center px-1">Aucune photo</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoSelect(file);
                }}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-ci-green text-ci-green-dark px-4 py-2 text-sm font-medium hover:bg-ci-green-pale transition-colors disabled:opacity-60"
              >
                {uploading ? "Envoi en cours…" : photoSrc ? "Changer la photo" : "Ajouter une photo"}
              </button>
              {!holder && pendingPhoto && (
                <p className="text-xs text-neutral-500 mt-1">Sera envoyée à la création de la fiche</p>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-ci-green px-6 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : holder ? "Mettre à jour" : "Créer la fiche"}
          </button>

          {holder && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-full border border-red-300 text-red-600 px-5 py-2.5 font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col items-center gap-8">
        <div ref={frontRef}>
          <button
            type="button"
            onClick={() => setZoomed("front")}
            className="block p-0 m-0 border-0 bg-transparent cursor-zoom-in transition-transform hover:scale-[1.02] [transform:translateZ(0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ci-green rounded-[2.5mm]"
            aria-label="Agrandir le recto de la carte"
          >
            <ConsularCardFront holder={previewHolder} photoSrc={photoSrc} />
          </button>
        </div>
        <div ref={backRef}>
          <button
            type="button"
            onClick={() => setZoomed("back")}
            className="block p-0 m-0 border-0 bg-transparent cursor-zoom-in transition-transform hover:scale-[1.02] [transform:translateZ(0)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ci-green rounded-[2.5mm]"
            aria-label="Agrandir le verso de la carte"
          >
            <ConsularCardBack holder={previewHolder} />
          </button>
        </div>

        {zoomed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
            onClick={() => setZoomed(null)}
          >
            <button
              type="button"
              onClick={() => setZoomed(null)}
              className="absolute top-5 right-5 text-white/80 hover:text-white text-3xl leading-none"
              aria-label="Fermer"
            >
              ×
            </button>
            <div
              className="sm:[zoom:2.4]"
              style={typeof window !== "undefined" && window.innerWidth < 640 ? { zoom: mobileZoomScale } : undefined}
            >
              {zoomed === "front" && <ConsularCardFront holder={previewHolder} photoSrc={photoSrc} />}
              {zoomed === "back" && <ConsularCardBack holder={previewHolder} />}
            </div>
          </div>
        )}

        {holder && (
          <div className="w-full bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-neutral-700">Télécharger pour impression (haute qualité)</h2>

            {(
              [
                { key: "front" as const, ref: frontRef, label: "Carte — recto" },
                { key: "back" as const, ref: backRef, label: "Carte — verso" },
              ]
            ).map(({ key, ref, label }) => (
              <div key={key} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-600">{label}</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={exportingKey !== null}
                    onClick={() => handleExportImage(key, ref, "png")}
                    className="text-ci-green-dark hover:underline disabled:opacity-50"
                  >
                    {exportingKey === `${key}-png` ? "…" : "PNG"}
                  </button>
                  <button
                    type="button"
                    disabled={exportingKey !== null}
                    onClick={() => handleExportImage(key, ref, "jpeg")}
                    className="text-ci-green-dark hover:underline disabled:opacity-50"
                  >
                    {exportingKey === `${key}-jpeg` ? "…" : "JPEG"}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              disabled={exportingKey !== null}
              onClick={handleExportPdf}
              className="w-full rounded-full bg-ci-green px-4 py-2.5 text-white text-sm font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60"
            >
              {exportingKey === "pdf" ? "Génération du PDF…" : "Télécharger tout en PDF (2 pages)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
