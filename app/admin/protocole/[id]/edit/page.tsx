import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStaffById } from "@/lib/staff";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";
import { StaffForm } from "../../StaffForm";

export const metadata = { title: "Modifier la fiche — Protocole AMBACI Vienne" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditStaffPage({ params }: { params: Params }) {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const db = getDb();
  const authorized = await hasDepartment(db, user.id, "protocole");
  if (!authorized) redirect("/admin");

  const { id } = await params;
  const staff = await getStaffById(db, Number(id));
  if (!staff) notFound();

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin/protocole" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à la liste
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">{staff.full_name}</h1>
      <StaffForm staff={staff} />
    </main>
  );
}
