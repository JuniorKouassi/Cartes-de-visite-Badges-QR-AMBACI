import { LogoutButton } from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-navy-line px-6 py-2 flex items-center justify-between">
        <span className="text-white/60 text-xs">Administration — AMBACI Vienne</span>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
