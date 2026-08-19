/**
 * Passage de témoin vers Chrono.
 *
 * Le site sait qui est connecté et quel rôle la personne tient dans Chrono.
 * Plutôt que de lui redemander un mot de passe, il signe un jeton court que
 * Chrono vérifie avec le même secret partagé. Une seule connexion, un seul
 * annuaire à tenir.
 *
 * On n'utilise pas createToken() de lib/auth : il encode avec btoa(), qui
 * lève une exception sur les caractères accentués. Or nos fonctions en
 * contiennent ("Le Chargé d'Affaires a.i."). D'où l'encodage UTF-8 explicite
 * ci-dessous, que Chrono reproduit à l'identique.
 */
import type { ChronoRole } from "./adminUsers";

export const CHRONO_SSO_TTL_SECONDS = 60; // le jeton ne sert qu'au saut, une minute suffit

export type ChronoHandoff = {
  email: string;
  nom: string;
  role: ChronoRole;
  fonction: string | null;
};

function base64url(bytes: Uint8Array): string {
  let binaire = "";
  for (const b of bytes) binaire += String.fromCharCode(b);
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signer(secret: string, message: string): Promise<string> {
  const cle = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cle, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function creerJetonChrono(secret: string, donnees: ChronoHandoff): Promise<string> {
  const charge = {
    ...donnees,
    but: "chrono-sso",
    // Identifiant unique : Chrono refuse de rejouer un jeton déjà consommé,
    // même dans sa minute de validité.
    jti: crypto.randomUUID(),
    exp: Math.floor(Date.now() / 1000) + CHRONO_SSO_TTL_SECONDS,
  };
  const encode = base64url(new TextEncoder().encode(JSON.stringify(charge)));
  return `${encode}.${await signer(secret, encode)}`;
}
