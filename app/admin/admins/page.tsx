import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/authSession";
import { AdminsView } from "./AdminsView";
import { BackButton } from "../BackButton";

export const metadata = { title: "Administrateurs — AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-sm text-ci-green-dark hover:underline">
          ← Retour à l&apos;accueil
        </Link>
        <BackButton />
      </div>
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">Administrateurs</h1>
      <AdminsView currentUserId={user.id} />
    </main>
  );
}
