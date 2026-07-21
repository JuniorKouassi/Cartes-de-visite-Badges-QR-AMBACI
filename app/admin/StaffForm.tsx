"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BusinessCardFront, BusinessCardBack } from "@/components/BusinessCard";
import { Badge } from "@/components/Badge";
import { DEFAULT_INSTITUTION, type Staff } from "@/lib/staff";

type FormState = {
  full_name: string;
  function_title: string;
  institution: string;
  phone_office: string;
  phone_cell: string;
  email: string;
  valid_until: string;
  active: boolean;
  matricule: string;
};

function toFormState(staff?: Staff): FormState {
  return {
    full_name: staff?.full_name ?? "",
    function_title: staff?.function_title ?? "",
    institution: staff?.institution ?? DEFAULT_INSTITUTION,
    phone_office: staff?.phone_office ?? "",
    phone_cell: staff?.phone_cell ?? "",
    email: staff?.email ?? "",
    valid_until: staff?.valid_until ?? "",
    active: staff ? Boolean(staff.active) : true,
    matricule: staff?.matricule ?? "",
  };
}

export function StaffForm({ staff }: { staff?: Staff }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(staff));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    };
  }, [pendingPhotoUrl]);

  const previewStaff: Staff = {
    id: staff?.id ?? 0,
    slug: staff?.slug ?? "apercu",
    matricule: form.matricule || staff?.matricule || "APERÇU",
    full_name: form.full_name || "Nom Prénom",
    function_title: form.function_title || "Fonction",
    institution: form.institution || DEFAULT_INSTITUTION,
    phone_office: form.phone_office || null,
    phone_cell: form.phone_cell || null,
    email: form.email || null,
    photo_key: staff?.photo_key ?? null,
    valid_until: form.valid_until || null,
    active: form.active ? 1 : 0,
    created_at: staff?.created_at ?? "",
    updated_at: staff?.updated_at ?? "",
  };

  const cardQrSrc = staff ? `/qr/card/${staff.slug}.png` : null;
  const badgeQrSrc = staff ? `/qr/verify/${staff.matricule}.png` : null;
  const photoSrc = pendingPhotoUrl ?? (staff?.photo_key ? `/api/photo/${staff.photo_key}` : null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      full_name: form.full_name,
      function_title: form.function_title,
      institution: form.institution,
      phone_office: form.phone_office || null,
      phone_cell: form.phone_cell || null,
      email: form.email || null,
      valid_until: form.valid_until || null,
      active: form.active,
      matricule: form.matricule || undefined,
    };

    try {
      const res = await fetch(staff ? `/api/staff/${staff.id}` : "/api/staff", {
        method: staff ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Échec de l'enregistrement");
      }
      const saved: Staff = await res.json();

      if (!staff) {
        if (pendingPhoto) await uploadPhoto(saved.id, pendingPhoto);
        router.push(`/admin/${saved.id}/edit`);
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
      const res = await fetch(`/api/staff/${id}/photo`, { method: "POST", body });
      if (!res.ok) throw new Error("Échec de l'envoi de la photo");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!staff) return;
    if (!window.confirm(`Supprimer définitivement la fiche de ${staff.full_name} ? Cette action est irréversible.`)) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${staff.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Échec de la suppression");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setDeleting(false);
    }
  }

  function handlePhotoSelect(file: File) {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    setPendingPhoto(file);
    setPendingPhotoUrl(URL.createObjectURL(file));

    if (staff) {
      void uploadPhoto(staff.id, file).then(() => router.refresh());
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom complet *</label>
          <input
            required
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fonction *</label>
          <input
            required
            value={form.function_title}
            onChange={(e) => update("function_title", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Institution</label>
          <input
            value={form.institution}
            onChange={(e) => update("institution", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tél. bureau</label>
            <input
              value={form.phone_office}
              onChange={(e) => update("phone_office", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tél. cellulaire</label>
            <input
              value={form.phone_cell}
              onChange={(e) => update("phone_cell", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Matricule</label>
            <input
              value={form.matricule}
              onChange={(e) => update("matricule", e.target.value)}
              placeholder="Auto-généré si vide"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valide jusqu&apos;au</label>
            <input
              type="date"
              value={form.valid_until}
              onChange={(e) => update("valid_until", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-ci-green focus:ring-ci-green"
          />
          Badge actif
        </label>

        <div>
          <label className="block text-sm font-medium mb-1">Photo du badge</label>
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
              {!staff && pendingPhoto && (
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
            {saving ? "Enregistrement…" : staff ? "Mettre à jour" : "Créer la fiche"}
          </button>

          {staff && (
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

        {staff && (
          <div className="flex gap-3 pt-2 text-sm">
            <a href={`/qr/card/${staff.slug}.png`} download className="text-ci-green-dark hover:underline">
              Télécharger le QR carte de visite
            </a>
            <a href={`/qr/verify/${staff.matricule}.png`} download className="text-ci-green-dark hover:underline">
              Télécharger le QR badge
            </a>
          </div>
        )}
      </form>

      <div className="flex flex-col items-center gap-8">
        <BusinessCardFront staff={previewStaff} />
        {cardQrSrc ? (
          <BusinessCardBack staff={previewStaff} qrSrc={cardQrSrc} />
        ) : (
          <p className="text-sm text-neutral-400">QR de la carte disponible après enregistrement</p>
        )}
        {badgeQrSrc ? (
          <Badge staff={previewStaff} photoSrc={photoSrc} qrSrc={badgeQrSrc} />
        ) : (
          <p className="text-sm text-neutral-400">Badge disponible après enregistrement</p>
        )}
      </div>
    </div>
  );
}
