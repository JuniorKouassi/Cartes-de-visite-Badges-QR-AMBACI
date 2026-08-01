"use client";

import { useEffect, useState } from "react";

type Admin = { id: number; email: string; totp_enabled: number; created_at: string };

export function AdminsView({ currentUserId }: { currentUserId: number }) {
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

    try {
      const res = await fetch("/api/auth/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec de l'invitation");
      setMessage(`Invitation envoyée à ${email}.`);
      setEmail("");
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setInviting(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
        <h2 className="font-medium mb-1">Inviter un administrateur</h2>
        <p className="text-sm text-neutral-500 mb-4">
          La personne invitée recevra un e-mail pour choisir elle-même son mot de passe. Le lien expire
          dans 24 heures.
        </p>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
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
            disabled={inviting}
            className="rounded-full bg-ci-green px-5 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60 shrink-0"
          >
            {inviting ? "Envoi…" : "Inviter"}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        {message && <p className="text-sm text-ci-green-dark mt-3">{message}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y divide-neutral-100">
        {admins === null && <p className="p-6 text-neutral-500 text-center text-sm">Chargement…</p>}
        {admins?.length === 0 && <p className="p-6 text-neutral-500 text-center text-sm">Aucun administrateur.</p>}
        {admins?.map((admin) => (
          <div key={admin.id} className="flex items-center justify-between gap-4 p-4">
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
            {admin.id !== currentUserId && (
              <button
                type="button"
                onClick={() => handleRemove(admin)}
                disabled={removingId === admin.id}
                className="shrink-0 text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                {removingId === admin.id ? "…" : "Retirer"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
