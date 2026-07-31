"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { ebGaramond } from "@/lib/fonts";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ci-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ci-green focus-visible:border-ci-green disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 10) {
      setError("Le mot de passe doit contenir au moins 10 caractères");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec de la réinitialisation");
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`${ebGaramond.className} min-h-screen w-full flex items-center justify-center bg-[linear-gradient(135deg,#FFF0E0_0%,#F7F5F0_45%,#E6F7EE_100%)] p-4`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 md:p-10 shadow-2xl ring-1 ring-black/5"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-navy-deep">Nouveau mot de passe</h1>

        {!token ? (
          <p className="text-sm text-red-600 mt-4">Ce lien de réinitialisation est invalide.</p>
        ) : done ? (
          <p className="text-sm text-ci-green-dark bg-ci-green-pale rounded-lg p-4 mt-6">
            Mot de passe mis à jour. Redirection vers la connexion…
          </p>
        ) : (
          <>
            <p className="text-neutral-500 mb-8">Choisissez un nouveau mot de passe pour votre compte.</p>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 10 caractères"
                    required
                    autoComplete="new-password"
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-700"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type={isPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-ci-green hover:bg-ci-green-dark text-white py-3 rounded-lg transition-colors duration-300"
              >
                <span className="flex items-center justify-center">
                  {submitting ? "Mise à jour…" : "Réinitialiser le mot de passe"}
                  {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </span>
              </Button>
            </form>
          </>
        )}

        <div className="text-center mt-6">
          <a href="/login" className="text-ci-green-dark hover:underline text-sm transition-colors">
            ← Retour à la connexion
          </a>
        </div>
      </motion.div>
    </div>
  );
}
