import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMBACI Vienne — Cartes de visite & Badges",
  description:
    "Cartes de visite numériques et badges d'identité du personnel de l'Ambassade / Mission permanente de Côte d'Ivoire à Vienne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutral-100 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
