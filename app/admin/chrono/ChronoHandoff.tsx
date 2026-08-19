"use client";

import { useEffect, useRef } from "react";

/**
 * Le jeton part en POST, jamais dans l'adresse : un paramètre d'URL se
 * retrouverait dans l'historique du navigateur, dans les journaux du serveur
 * et dans l'en-tête Referer.
 */
export function ChronoHandoff({ url, jeton }: { url: string; jeton: string }) {
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    form.current?.submit();
  }, []);

  return (
    <main className="min-h-[calc(100vh-3.4rem)] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-10 h-10 rounded-full border-2 border-ci-orange border-t-transparent animate-spin mb-6" />
      <p className="text-neutral-500">Ouverture de Chrono…</p>

      <form ref={form} method="POST" action={`${url}/entrer`} className="mt-8">
        <input type="hidden" name="jeton" value={jeton} />
        <noscript>
          <button
            type="submit"
            className="rounded-lg bg-ci-orange px-5 py-2.5 font-semibold text-white"
          >
            Continuer vers Chrono
          </button>
        </noscript>
      </form>
    </main>
  );
}
