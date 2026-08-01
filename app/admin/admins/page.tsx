import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/authSession";
import { AdminsView } from "./AdminsView";

export const metadata = { title: "Administrateurs — AMBACI Vienne" };
export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl font-bold mb-6">Administrateurs</h1>
      <AdminsView currentUserId={user.id} />
    </main>
  );
}
