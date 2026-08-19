interface CloudflareEnv {
  SESSION_SECRET: string;
  // Resend API key used to send password-reset emails.
  RESEND_API_KEY: string;
  // Adresse publique du Worker Chrono, déclarée dans wrangler.jsonc.
  CHRONO_URL: string;
  // Secret partagé avec Chrono, qui signe le passage de témoin.
  // Posé par: npx wrangler secret put CHRONO_SSO_SECRET
  CHRONO_SSO_SECRET: string;
}
