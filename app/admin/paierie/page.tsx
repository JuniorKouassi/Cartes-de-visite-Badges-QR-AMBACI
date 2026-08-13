import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export const metadata = { title: "Paierie — Admin AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function PaieriePage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const authorized = await hasDepartment(getDb(), user.id, "paierie");
  if (!authorized) redirect("/admin");

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/admin" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à l&apos;accueil
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-4">Paierie</h1>
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-8 text-center">
        <p className="text-neutral-500">Ce module est en cours de construction.</p>
      </div>
    </main>
  );
}
