import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export const metadata = { title: "Service consulaire — Admin AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function ConsulairePage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const authorized = await hasDepartment(getDb(), user.id, "consulaire");
  if (!authorized) redirect("/admin");

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-8">Service consulaire</h1>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/admin/consulaire/cartes"
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 hover:ring-ci-green hover:shadow-md transition-all"
        >
          <h2 className="font-medium text-navy-deep">Cartes consulaires &amp; Passeports</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Enregistrer les ressortissants ivoiriens de la circonscription et éditer leur carte
            consulaire (recto/verso).
          </p>
        </Link>

        <div className="rounded-xl bg-neutral-100 p-6 ring-1 ring-black/5 opacity-60">
          <h2 className="font-medium text-neutral-500">Visas</h2>
          <p className="text-sm text-neutral-400 mt-2">Module à venir.</p>
          <p className="text-xs text-ci-orange-dark mt-3">En construction</p>
        </div>
      </div>
    </main>
  );
}
