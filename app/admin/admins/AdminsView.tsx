"use client";

import { useEffect, useState } from "react";

type Department = "protocole" | "consulaire" | "paierie" | "chrono";
type ChronoRole = "chef" | "secretariat" | "conseiller" | "rpa" | "payeur" | "saf" | "admin" | "neutre";
type Admin = {
  id: number; email: string; name: string | null; phone: string | null; totp_enabled: number; created_at: string;
  departments: Department[]; chronoRole: ChronoRole | null; chronoFonction: string | null;
};

const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: "protocole", label: "Protocole" },
  { value: "consulaire", label: "Service consulaire" },
  { value: "paierie", label: "Paierie" },
  { value: "chrono", label: "Chrono" },
];

// Le rôle dit ce qu'on fait DANS Chrono. L'habilitation dit seulement qu'on y entre.
const CHRONO_ROLE_OPTIONS: { value: ChronoRole; label: string; aide: string }[] = [
  { value: "chef", label: "Chef de mission", aide: "Signe le courrier départ, impute le courrier arrivée" },
  { value: "secretariat", label: "Secrétariat", aide: "Rédige, enregistre, imprime, tient les registres" },
  { value: "conseiller", label: "Conseiller", aide: "Ne voit que les dossiers qui lui sont imputés" },
  { value: "rpa", label: "RPA", aide: "Mêmes droits que Conseiller" },
  { value: "payeur", label: "Payeur", aide: "Mêmes droits que Conseiller" },
  { value: "saf", label: "SAF", aide: "Mêmes droits que Conseiller" },
  { value: "admin", label: "Administrateur", aide: "Tout, y compris les paramètres du poste" },
  { value: "neutre", label: "Neutre (en mission)", aide: "Aucun droit, n'apparaît plus dans les listes d'imputation ; historique conservé" },
];

function ChronoRoleSelect({
  value,
  fonction,
  onChange,
}: {
  value: ChronoRole | null;
  fonction: string;
  onChange: (role: ChronoRole | null, fonction: string) => void;
}) {
  const choisi = CHRONO_ROLE_OPTIONS.find((o) => o.value === value);
  return (
    <div className="w-full rounded-lg bg-navy/5 px-3 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-deep mb-2">Rôle dans Chrono</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={value ?? ""}
          onChange={(e) => onChange((e.target.value || null) as ChronoRole | null, fonction)}
          className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm"
        >
          <option value="">— aucun —</option>
          {CHRONO_ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {(value === "chef" || value === "admin") && (
          <input
            value={fonction}
            onChange={(e) => onChange(value, e.target.value)}
            placeholder="Le Chargé d'Affaires a.i."
            className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm w-56"
          />
        )}
      </div>
      {choisi && <p className="mt-1.5 text-xs text-neutral-500">{choisi.aide}</p>}
    </div>
  );
}

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteDepartments, setInviteDepartments] = useState<Department[]>(["protocole"]);
  const [inviteChronoRole, setInviteChronoRole] = useState<ChronoRole | null>(null);
  const [inviteChronoFonction, setInviteChronoFonction] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDepartments, setEditDepartments] = useState<Department[]>([]);
  const [editChronoRole, setEditChronoRole] = useState<ChronoRole | null>(null);
  const [editChronoFonction, setEditChronoFonction] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
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
        body: JSON.stringify({
          email,
          name,
          phone,
          departments: inviteDepartments,
          chronoRole: inviteChronoRole,
          chronoFonction: inviteChronoFonction,
        }),
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
      setName("");
      setPhone("");
      setInviteDepartments(["protocole"]);
      setInviteChronoRole(null);
      setInviteChronoFonction("");
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
    setEditChronoRole(admin.chronoRole);
    setEditChronoFonction(admin.chronoFonction ?? "");
    setEditName(admin.name ?? "");
    setEditPhone(admin.phone ?? "");
    setError(null);
  }

  async function saveDepartments(admin: Admin) {
    setSavingDepartments(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          departments: editDepartments,
          chronoRole: editChronoRole,
          chronoFonction: editChronoFonction,
        }),
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet"
              className="w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nouvel.admin@ambaci.at"
              required
              className="w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone (WhatsApp)"
              className="w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ci-green"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                inviting ||
                inviteDepartments.length === 0 ||
                (inviteDepartments.includes("chrono") && !inviteChronoRole)
              }
              className="w-full sm:w-auto rounded-full bg-ci-green px-5 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60"
            >
              {inviting ? "Envoi…" : "Inviter"}
            </button>
          </div>
          <DepartmentCheckboxes selected={inviteDepartments} onChange={setInviteDepartments} />
          {inviteDepartments.includes("chrono") && (
            <div className="mt-3">
              <ChronoRoleSelect
                value={inviteChronoRole}
                fonction={inviteChronoFonction}
                onChange={(r, f) => { setInviteChronoRole(r); setInviteChronoFonction(f); }}
              />
            </div>
          )}
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
                  {admin.name || admin.email}
                  {admin.id === currentUserId && <span className="text-neutral-400 font-normal"> (vous)</span>}
                </p>
                {admin.name && <p className="text-xs text-neutral-500">{admin.email}</p>}
                {admin.phone && <p className="text-xs text-neutral-500">{admin.phone}</p>}
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
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nom complet"
                  className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Téléphone (WhatsApp)"
                  className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm"
                />
                <DepartmentCheckboxes selected={editDepartments} onChange={setEditDepartments} />
                {editDepartments.includes("chrono") && (
                  <ChronoRoleSelect
                    value={editChronoRole}
                    fonction={editChronoFonction}
                    onChange={(r, f) => { setEditChronoRole(r); setEditChronoFonction(f); }}
                  />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveDepartments(admin)}
                    disabled={
                      savingDepartments ||
                      editDepartments.length === 0 ||
                      (editDepartments.includes("chrono") && !editChronoRole)
                    }
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
                {admin.chronoRole && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-navy/10 text-navy-deep">
                    Chrono : {CHRONO_ROLE_OPTIONS.find((o) => o.value === admin.chronoRole)?.label}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
