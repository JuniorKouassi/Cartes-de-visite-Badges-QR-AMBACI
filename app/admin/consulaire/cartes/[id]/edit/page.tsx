import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getConsularHolderById } from "@/lib/consularHolders";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";
import { ConsularHolderForm } from "../../ConsularHolderForm";

export const metadata = { title: "Modifier la fiche — Service consulaire AMBACI Vienne" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditConsularHolderPage({ params }: { params: Params }) {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const db = getDb();
  const authorized = await hasDepartment(db, user.id, "consulaire");
  if (!authorized) redirect("/admin");

  const { id } = await params;
  const holder = await getConsularHolderById(db, Number(id));
  if (!holder) notFound();

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin/consulaire/cartes" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à la liste
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">
        {holder.first_names} {holder.last_name}
      </h1>
      <ConsularHolderForm holder={holder} />
    </main>
  );
}
