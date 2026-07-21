import Link from "next/link";
import { getDb } from "@/lib/db";
import { listStaff } from "@/lib/staff";

export const metadata = { title: "Admin — AMBACI Vienne" };

type SearchParams = Promise<{ q?: string }>;

export default async function AdminListPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const staff = await listStaff(getDb(), q);

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-serif text-2xl font-bold">Personnel — AMBACI Vienne</h1>
        <Link
          href="/admin/new"
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
          placeholder="Rechercher un nom, une fonction, un matricule…"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ci-green"
        />
      </form>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y divide-neutral-100">
        {staff.length === 0 && <p className="p-6 text-neutral-500 text-center">Aucune fiche trouvée.</p>}
        {staff.map((s) => (
          <Link
            key={s.id}
            href={`/admin/${s.id}/edit`}
            className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 transition-colors"
          >
            <div>
              <p className="font-medium">{s.full_name}</p>
              <p className="text-sm text-neutral-500">
                {s.function_title} · {s.matricule}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                s.active ? "bg-ci-green-pale text-ci-green-dark" : "bg-red-100 text-red-700"
              }`}
            >
              {s.active ? "Actif" : "Désactivé"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
