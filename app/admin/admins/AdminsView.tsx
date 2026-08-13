"use client";

import { useEffect, useState } from "react";

type Department = "protocole" | "consulaire" | "paierie";
type Admin = { id: number; email: string; totp_enabled: number; created_at: string; departments: Department[] };

const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: "protocole", label: "Protocole" },
  { value: "consulaire", label: "Service consulaire" },
  { value: "paierie", label: "Paierie" },
];

function DepartmentCheckboxes({
  selected,
  onChange,
}: {
  selected: Department[];
  onChange: (departments: Department[]) => void;
}) {
  function toggle(dept: Department) {
    onChange(selected.includes(dept) ? selected.filter((d) => d !== dept) : [...selected, dept]);
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {DEPARTMENT_OPTIONS.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="h-4 w-4 rounded border-neutral-300 text-ci-green focus:ring-ci-green"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function AdminsView({ currentUserId }: { currentUserId: number }) {
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [inviteDepartments, setInviteDepartments] = useState<Department[]>(["protocole"]);
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDepartments, setEditDepartments] = useState<Department[]>([]);
  const [savingDepartments, setSavingDepartments] = useState(false);

  async function loadAdmins() {
    const res = await fetch("/api/auth/admins");
    const data = (await res.json().catch(() => null)) as { admins?: Admin[]; error?: string } | null;
    if (res.ok && data?.admins) setAdmins(data.admins);
  }

  useEffect(() => {
    void loadAdmins();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setMessage(null);
    setManualLink(null);
    setCopied(false);

    try {
      const res = await fetch("/api/auth/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, departments: inviteDepartments }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; emailSent?: boolean; setPasswordUrl?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec de l'invitation");

      if (data?.emailSent) {
        setMessage(`Invitation envoyée à ${email}.`);
      } else if (data?.setPasswordUrl) {
        setManualLink(data.setPasswordUrl);
      }
      setEmail("");
      setInviteDepartments(["protocole"]);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setInviting(false);
    }
  }

  async function copyManualLink() {
    if (!manualLink) return;
    await navigator.clipboard.writeText(manualLink);
    setCopied(true);
  }

  async function handleRemove(admin: Admin) {
    if (!window.confirm(`Retirer ${admin.email} de la liste des administrateurs ?`)) return;

    setRemovingId(admin.id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/auth/admins/${admin.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec du retrait");
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setRemovingId(null);
    }
  }

  function startEditing(admin: Admin) {
    setEditingId(admin.id);
    setEditDepartments(admin.departments);
    setError(null);
  }

  async function saveDepartments(admin: Admin) {
    setSavingDepartments(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departments: editDepartments }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec de la mise à jour");
      setEditingId(null);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSavingDepartments(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
        <h2 className="font-medium mb-1">Inviter un administrateur</h2>
        <p className="text-sm text-neutral-500 mb-4">
          La personne invitée recevra un e-mail pour choisir elle-même son mot de passe. Le lien expire
          dans 24 heures.
        </p>

        <form onSubmit={handleInvite} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nouvel.admin@ambaci.at"
              required
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
            <button
              type="submit"
              disabled={inviting || inviteDepartments.length === 0}
              className="rounded-full bg-ci-green px-5 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60 shrink-0"
            >
              {inviting ? "Envoi…" : "Inviter"}
            </button>
          </div>
          <DepartmentCheckboxes selected={inviteDepartments} onChange={setInviteDepartments} />
        </form>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {message && <p className="text-sm text-ci-green-dark mt-3">{message}</p>}

        {manualLink && (
          <div className="mt-4 rounded-lg bg-ci-orange-pale p-4 space-y-2">
            <p className="text-sm text-neutral-700">
              Le compte a été créé, mais l&apos;e-mail n&apos;a pas pu être envoyé (aucun domaine vérifié sur
              Resend pour le moment). Partagez ce lien vous-même avec la personne — il expire dans 24h :
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={manualLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-mono"
              />
              <button
                type="button"
                onClick={copyManualLink}
                className="shrink-0 rounded-full border border-ci-orange-dark text-ci-orange-dark px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y divide-neutral-100">
        {admins === null && <p className="p-6 text-neutral-500 text-center text-sm">Chargement…</p>}
        {admins?.length === 0 && <p className="p-6 text-neutral-500 text-center text-sm">Aucun administrateur.</p>}
        {admins?.map((admin) => (
          <div key={admin.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">
                  {admin.email}
                  {admin.id === currentUserId && <span className="text-neutral-400 font-normal"> (vous)</span>}
                </p>
                <p className="text-xs text-neutral-500">
                  2FA {admin.totp_enabled ? "activée" : "désactivée"} · depuis{" "}
                  {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {editingId !== admin.id && (
                  <button
                    type="button"
                    onClick={() => startEditing(admin)}
                    className="text-sm text-ci-green-dark hover:underline"
                  >
                    Modifier
                  </button>
                )}
                {admin.id !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleRemove(admin)}
                    disabled={removingId === admin.id}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    {removingId === admin.id ? "…" : "Retirer"}
                  </button>
                )}
              </div>
            </div>

            {editingId === admin.id ? (
              <div className="flex flex-wrap items-center gap-3">
                <DepartmentCheckboxes selected={editDepartments} onChange={setEditDepartments} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveDepartments(admin)}
                    disabled={savingDepartments || editDepartments.length === 0}
                    className="text-sm rounded-full bg-ci-green px-3 py-1 text-white font-medium hover:bg-ci-green-dark transition-colors disabled:opacity-60"
                  >
                    {savingDepartments ? "…" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-neutral-500 hover:underline"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {admin.departments.length === 0 && (
                  <span className="text-xs text-neutral-400">Aucun département</span>
                )}
                {admin.departments.map((dept) => (
                  <span
                    key={dept}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-ci-green-pale text-ci-green-dark"
                  >
                    {DEPARTMENT_OPTIONS.find((o) => o.value === dept)?.label ?? dept}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
