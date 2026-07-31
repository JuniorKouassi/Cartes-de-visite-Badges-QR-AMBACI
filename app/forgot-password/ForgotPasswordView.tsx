"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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

export function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? "Échec de la demande");
      setMessage(data?.message ?? "Si un compte existe avec cette adresse, un e-mail vient de lui être envoyé.");
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
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-navy-deep">Mot de passe oublié</h1>
        <p className="text-neutral-500 mb-8">
          Entrez votre adresse e-mail, nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>

        {message ? (
          <p className="text-sm text-ci-green-dark bg-ci-green-pale rounded-lg p-4">{message}</p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@ambaci.at"
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-ci-green hover:bg-ci-green-dark text-white py-3 rounded-lg transition-colors duration-300"
            >
              <span className="flex items-center justify-center">
                {submitting ? "Envoi…" : "Envoyer le lien"}
                {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </span>
            </Button>
          </form>
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
