import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStaffById } from "@/lib/staff";
import { StaffForm } from "../../StaffForm";

export const metadata = { title: "Modifier la fiche — Admin AMBACI Vienne" };

type Params = Promise<{ id: string }>;

export default async function EditStaffPage({ params }: { params: Params }) {
  const { id } = await params;
  const staff = await getStaffById(getDb(), Number(id));
  if (!staff) notFound();

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à la liste
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">{staff.full_name}</h1>
      <StaffForm staff={staff} />
    </main>
  );
}
