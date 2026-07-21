import Link from "next/link";
import { StaffForm } from "../StaffForm";

export const metadata = { title: "Nouvelle fiche — Admin AMBACI Vienne" };

export default function NewStaffPage() {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/admin" className="text-sm text-ci-green-dark hover:underline">
        ← Retour à la liste
      </Link>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">Nouvelle fiche personnel</h1>
      <StaffForm />
    </main>
  );
}
