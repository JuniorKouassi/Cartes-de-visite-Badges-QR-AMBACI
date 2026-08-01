import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

function AdminBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#ffdcae,transparent)]" />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AdminBackground />
      <div className="bg-gradient-to-b from-ci-green to-ci-green-dark px-6 py-2 flex items-center justify-between">
        <span className="text-white/80 text-xs">Administration — AMBACI Vienne</span>
        <div className="flex items-center gap-4">
          <Link href="/admin/admins" className="text-white/80 hover:text-white text-sm hover:underline">
            Administrateurs
          </Link>
          <Link href="/admin/security" className="text-white/80 hover:text-white text-sm hover:underline">
            Sécurité
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="flex h-[3px]">
        <div className="flex-1 bg-ci-orange" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-ci-green" />
      </div>
      {children}
    </div>
  );
}
