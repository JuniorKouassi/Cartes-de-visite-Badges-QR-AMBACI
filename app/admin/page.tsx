import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getAdminDepartments, type Department } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";
import { DashboardTiles } from "./DashboardTiles";

export const metadata = { title: "Admin — AMBACI Vienne" };
export const dynamic = "force-dynamic";

const TILES: { department: Department; title: string; description: string; href: string; ready: boolean }[] = [
  {
    department: "protocole",
    title: "Protocole",
    description: "Cartes de visite et badges QR du personnel de l'ambassade.",
    href: "/admin/protocole",
    ready: true,
  },
  {
    department: "consulaire",
    title: "Service consulaire",
    description: "Passeports, visas et cartes consulaires des ressortissants ivoiriens.",
    href: "/admin/consulaire",
    ready: false,
  },
  {
    department: "paierie",
    title: "Paierie",
    description: "Module à venir.",
    href: "/admin/paierie",
    ready: false,
  },
];

export default async function AdminHomePage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/login");

  const departments = await getAdminDepartments(getDb(), user.id);

  return (
    <main className="min-h-[calc(100vh-3.4rem)] flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">AMBACI Vienne — Administration</h1>
      <p className="text-neutral-500 mb-12">Choisissez un service.</p>

      <DashboardTiles tiles={TILES} departments={departments} />
    </main>
  );
}
