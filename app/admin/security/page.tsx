import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/authSession";
import { SecurityView } from "./SecurityView";

export const metadata = { title: "Sécurité — AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl font-bold mb-6">Sécurité du compte</h1>
      <SecurityView email={user.email} totpEnabled={user.totp_enabled === 1} />
    </main>
  );
}
