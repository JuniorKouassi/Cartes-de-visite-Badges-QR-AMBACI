export type Lang = "fr" | "en";

export const cardStrings: Record<Lang, Record<string, string>> = {
  fr: {
    tel: "Tel.",
    cel: "Portable",
    email: "E-Mail",
    addressLine1: "Muthgasse 13/3/332-333",
    addressLine2: "A-1190 Wien / Vienne",
    addressCountry: "Autriche",
    scanForCard: "Scannez pour ma carte de visite",
    flipHint: "Touchez la carte pour la retourner",
    saveContact: "Enregistrer le contact",
    downloadPng: "Télécharger en PNG",
    downloadJpeg: "Télécharger en JPEG",
  },
  en: {
    tel: "Tel.",
    cel: "Mobile",
    email: "E-Mail",
    addressLine1: "Muthgasse 13/3/332-333",
    addressLine2: "A-1190 Wien / Vienna",
    addressCountry: "Austria",
    scanForCard: "Scan for my business card",
    flipHint: "Tap the card to flip it",
    saveContact: "Save contact",
    downloadPng: "Download as PNG",
    downloadJpeg: "Download as JPEG",
  },
};

export const verifyStrings: Record<Lang, Record<string, string>> = {
  fr: {
    title: "Vérification de badge",
    authentic: "Membre du personnel authentique",
    invalid: "Badge non valide",
    validUntil: "Valide jusqu'au",
    permanentValidity: "Validité permanente",
    invalidReason: "Ce badge a été désactivé ou a expiré",
    matricule: "Matricule",
    institution: "Institution",
    footer: "Ambassade / Mission permanente de Côte d'Ivoire - Autriche",
  },
  en: {
    title: "Badge verification",
    authentic: "Authentic staff member",
    invalid: "Invalid badge",
    validUntil: "Valid until",
    permanentValidity: "Permanent validity",
    invalidReason: "This badge has been deactivated or has expired",
    matricule: "Staff ID",
    institution: "Institution",
    footer: "Embassy / Permanent Mission of Côte d'Ivoire - Austria",
  },
};

export const dateLocale: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-GB",
};
