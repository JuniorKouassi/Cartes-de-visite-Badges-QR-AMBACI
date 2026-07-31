const DEFAULT_FROM = "AMBACI Vienne <onboarding@resend.dev>";

export async function sendPasswordResetEmail(
  env: CloudflareEnv,
  to: string,
  resetUrl: string
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to,
      subject: "Réinitialisation de votre mot de passe — AMBACI Vienne",
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation du mot de passe de votre compte administrateur AMBACI Vienne.</p>
        <p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
        <p>Ce lien expire dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      `,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Échec de l'envoi de l'e-mail (${res.status}): ${detail}`);
  }
}
