import { redirect } from "next/navigation";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getAdminDepartments, getChronoGrant } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";
import { creerJetonChrono } from "@/lib/chronoLink";
import { ChronoHandoff } from "./ChronoHandoff";

export const metadata = { title: "Chrono — AMBACI Vienne" };
export const dynamic = "force-dynamic";

function Avertissement({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-3.4rem)] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-2xl font-bold mb-3">{titre}</h1>
      <p className="max-w-md text-neutral-500 leading-relaxed">{children}</p>
      <Link href="/admin" className="mt-8 rounded-lg bg-navy-deep px-5 py-2.5 font-semibold text-white">
        Retour au tableau de bord
      </Link>
    </main>
  );
}

export default async function ChronoPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const db = getDb();
  const departments = await getAdminDepartments(db, user.id);
  if (!departments.includes("chrono")) {
    return (
      <Avertissement titre="Accès non autorisé">
        Votre compte n’est pas habilité au service Chrono. Demandez à un administrateur
        de vous l’ouvrir depuis la page Administrateurs.
      </Avertissement>
    );
  }

  const grant = await getChronoGrant(db, user.id);
  if (!grant) {
    return (
      <Avertissement titre="Rôle Chrono non défini">
        Vous êtes habilité au service, mais aucun rôle ne vous a été attribué à l’intérieur.
        Chrono a besoin de savoir si vous signez, rédigez ou traitez des dossiers.
        Un administrateur le règle depuis la page Administrateurs.
      </Avertissement>
    );
  }

  const { env } = getCloudflareContext();
  const url = env.CHRONO_URL;
  const secret = env.CHRONO_SSO_SECRET;

  if (!url || !secret) {
    return (
      <Avertissement titre="Chrono n’est pas encore relié">
        Il manque <code>CHRONO_URL</code> ou <code>CHRONO_SSO_SECRET</code> dans la
        configuration du Worker. Voir la section Chrono du README.
      </Avertissement>
    );
  }

  const jeton = await creerJetonChrono(secret, {
    email: user.email,
    nom: user.email.split("@")[0],
    role: grant.role,
    fonction: grant.fonction,
  });

  return <ChronoHandoff url={url.replace(/\/+$/, "")} jeton={jeton} />;
}
