import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getAdminDepartments, type Department } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export const metadata = { title: "Admin — AMBACI Vienne" };
export const dynamic = "force-dynamic";

const TILES: { department: Department; title: string; description: string; href: string; ready: boolean }[] = [
  {
    department: "protocole",
    title: "Protocole",
    description: "Cartes de visite et badges QR du personnel de l'ambassade.",
    href: "/admin/protocole",
    ready: true,
  },
  {
    department: "consulaire",
    title: "Service consulaire",
    description: "Passeports, visas et cartes consulaires des ressortissants ivoiriens.",
    href: "/admin/consulaire",
    ready: false,
  },
  {
    department: "paierie",
    title: "Paierie",
    description: "Module à venir.",
    href: "/admin/paierie",
    ready: false,
  },
];

export default async function AdminHomePage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const departments = await getAdminDepartments(getDb(), user.id);

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="font-serif text-2xl font-bold mb-1">AMBACI Vienne — Administration</h1>
      <p className="text-neutral-500 mb-8">Choisissez un service.</p>

      <div className="grid sm:grid-cols-3 gap-5">
        {TILES.map((tile) => {
          const authorized = departments.includes(tile.department);

          if (!authorized) {
            return (
              <div
                key={tile.department}
                className="rounded-xl bg-neutral-100 p-6 ring-1 ring-black/5 opacity-60"
                title="Accès non autorisé"
              >
                <h2 className="font-medium text-neutral-500">🔒 {tile.title}</h2>
                <p className="text-sm text-neutral-400 mt-2">{tile.description}</p>
                <p className="text-xs text-neutral-400 mt-3">Accès non autorisé</p>
              </div>
            );
          }

          return (
            <Link
              key={tile.department}
              href={tile.href}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 hover:ring-ci-green hover:shadow-md transition-all"
            >
              <h2 className="font-medium text-navy-deep">{tile.title}</h2>
              <p className="text-sm text-neutral-500 mt-2">{tile.description}</p>
              {!tile.ready && <p className="text-xs text-ci-orange-dark mt-3">En construction</p>}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
