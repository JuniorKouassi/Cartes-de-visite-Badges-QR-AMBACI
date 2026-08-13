import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";
import { ConsularHolderForm } from "../ConsularHolderForm";

export const metadata = { title: "Nouvelle fiche — Service consulaire AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function NewConsularHolderPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");
  const authorized = await hasDepartment(getDb(), user.id, "consulaire");
  if (!authorized) redirect("/admin");

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin/consulaire/cartes" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à la liste
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">Nouvelle fiche consulaire</h1>
      <ConsularHolderForm />
    </main>
  );
}
