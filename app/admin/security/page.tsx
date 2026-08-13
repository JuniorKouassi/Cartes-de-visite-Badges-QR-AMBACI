import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/authSession";
import { SecurityView } from "./SecurityView";
import { BackButton } from "../BackButton";

export const metadata = { title: "Sécurité — AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
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
      <h1 className="font-serif text-2xl font-bold mt-2 mb-6">Sécurité du compte</h1>
      <SecurityView email={user.email} totpEnabled={user.totp_enabled === 1} />
    </main>
  );
}
