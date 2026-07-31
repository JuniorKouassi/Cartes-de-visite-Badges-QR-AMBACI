import type { Metadata } from "next";
import { ForgotPasswordView } from "./ForgotPasswordView";

export const metadata: Metadata = { title: "Mot de passe oublié — AMBACI Vienne" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
