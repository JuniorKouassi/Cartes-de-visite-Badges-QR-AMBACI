import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordView } from "./ResetPasswordView";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe — AMBACI Vienne" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}
