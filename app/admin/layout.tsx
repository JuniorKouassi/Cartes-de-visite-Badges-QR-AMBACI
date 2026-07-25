import { LogoutButton } from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-gradient-to-b from-ci-green to-ci-green-dark px-6 py-2 flex items-center justify-between">
        <span className="text-white/80 text-xs">Administration — AMBACI Vienne</span>
        <LogoutButton />
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
