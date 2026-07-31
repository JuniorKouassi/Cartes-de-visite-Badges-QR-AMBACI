"use client";

import { useState } from "react";

type SetupData = { secret: string; otpauthUri: string; qrDataUrl: string };

export function SecurityView({ email, totpEnabled: initialTotpEnabled }: { email: string; totpEnabled: boolean }) {
  const [totpEnabled, setTotpEnabled] = useState(initialTotpEnabled);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function startEnrollment() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/setup", { method: "POST" });
      const data = (await res.json().catch(() => null)) as (SetupData & { error?: string }) | null;
      if (!res.ok || !data) throw new Error(data?.error ?? "Échec de l'initialisation");
      setSetupData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmEnrollment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Code incorrect");
      setTotpEnabled(true);
      setSetupData(null);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  async function disableTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec de la désactivation");
      setTotpEnabled(false);
      setShowDisableForm(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6 space-y-6">
      <div>
        <p className="text-sm text-neutral-500">Compte</p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="border-t border-neutral-100 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Authentification à deux facteurs</p>
            <p className="text-sm text-neutral-500">
              {totpEnabled
                ? "Activée — un code de votre application d'authentification est requis à la connexion."
                : "Désactivée — protégez votre compte avec une application d'authentification (Google Authenticator, Authy…)."}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
              totpEnabled ? "bg-ci-green-pale text-ci-green-dark" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {totpEnabled ? "Activée" : "Désactivée"}
          </span>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        {!totpEnabled && !setupData && (
          <button
            type="button"
            onClick={startEnrollment}
            disabled={submitting}
            className="mt-4 rounded-lg bg-ci-green px-5 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Initialisation…" : "Activer la 2FA"}
          </button>
        )}

        {setupData && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-neutral-600">
              Scannez ce QR code avec votre application d&apos;authentification, puis saisissez le code affiché pour
              confirmer.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, not a static asset */}
            <img src={setupData.qrDataUrl} alt="QR code d'activation 2FA" className="w-48 h-48 rounded-lg border border-neutral-200" />
            <p className="text-xs text-neutral-500">
              Ou entrez cette clé manuellement : <span className="font-mono">{setupData.secret}</span>
            </p>

            <form onSubmit={confirmEnrollment} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                className="w-40 h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ci-green focus:border-ci-green"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  className="rounded-lg bg-ci-green px-5 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors disabled:opacity-60"
                >
                  {submitting ? "Vérification…" : "Confirmer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSetupData(null);
                    setCode("");
                    setError(null);
                  }}
                  className="text-sm text-neutral-500 hover:underline"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {totpEnabled && !showDisableForm && (
          <button
            type="button"
            onClick={() => setShowDisableForm(true)}
            className="mt-4 text-sm text-red-600 hover:underline"
          >
            Désactiver la 2FA
          </button>
        )}

        {totpEnabled && showDisableForm && (
          <form onSubmit={disableTotp} className="mt-4 space-y-3">
            <label htmlFor="disable-password" className="block text-sm font-medium text-neutral-700">
              Confirmez avec votre mot de passe
            </label>
            <input
              id="disable-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full max-w-xs h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ci-green focus:border-ci-green"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-white font-medium shadow hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {submitting ? "Désactivation…" : "Désactiver"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDisableForm(false);
                  setPassword("");
                  setError(null);
                }}
                className="text-sm text-neutral-500 hover:underline"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
