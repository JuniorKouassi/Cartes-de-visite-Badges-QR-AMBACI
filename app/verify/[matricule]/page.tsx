import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb, getVerifyMode } from "@/lib/db";
import { getStaffByMatricule, isBadgeValid } from "@/lib/staff";
import { VerifyView } from "./VerifyView";

type Params = Promise<{ matricule: string }>;

export const metadata: Metadata = { title: "Vérification de badge — AMBACI Vienne" };

export default async function VerifyPage({ params }: { params: Params }) {
  const { matricule } = await params;
  const staff = await getStaffByMatricule(getDb(), matricule);
  if (!staff) notFound();

  const valid = isBadgeValid(staff);
  const mode = getVerifyMode();

  return <VerifyView staff={staff} valid={valid} mode={mode} />;
}
