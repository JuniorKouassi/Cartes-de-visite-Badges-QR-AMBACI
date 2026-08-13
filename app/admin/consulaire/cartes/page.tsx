import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { listConsularHolders } from "@/lib/consularHolders";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export const metadata = { title: "Cartes consulaires — Admin AMBACI Vienne" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string }>;

export default async function ConsularCardsListPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const db = getDb();
  const authorized = await hasDepartment(db, user.id, "consulaire");
  if (!authorized) redirect("/admin");

  const { q } = await searchParams;
  const holders = await listConsularHolders(db, q);

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin/consulaire" className="text-sm text-ci-green-dark hover:underline">
        ← Retour au service consulaire
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-6 mt-2">
        <h1 className="font-serif text-2xl font-bold">Cartes consulaires &amp; Passeports</h1>
        <Link
          href="/admin/consulaire/cartes/new"
          className="rounded-full bg-ci-green px-5 py-2.5 text-white font-medium shadow hover:bg-ci-green-dark transition-colors"
        >
          + Nouvelle fiche
        </Link>
      </div>

      <form className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un nom, un numéro de carte, un numéro de passeport…"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ci-green"
        />
      </form>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y divide-neutral-100">
        {holders.length === 0 && <p className="p-6 text-neutral-500 text-center">Aucune fiche trouvée.</p>}
        {holders.map((h) => (
          <Link
            key={h.id}
            href={`/admin/consulaire/cartes/${h.id}/edit`}
            className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 transition-colors"
          >
            <div>
              <p className="font-medium">
                {h.last_name} {h.first_names}
              </p>
              <p className="text-sm text-neutral-500">
                {h.card_number}
                {h.passport_number ? ` · Passeport ${h.passport_number}` : ""}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                h.active ? "bg-ci-green-pale text-ci-green-dark" : "bg-red-100 text-red-700"
              }`}
            >
              {h.active ? "Carte active" : "Carte désactivée"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
