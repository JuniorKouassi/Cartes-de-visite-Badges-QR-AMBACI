export type Lang = "fr" | "en";

export const cardStrings: Record<Lang, Record<string, string>> = {
  fr: {
    republic: "RÉPUBLIQUE DE CÔTE D'IVOIRE",
    motto: "Union – Discipline – Travail",
    tel: "Tél.",
    cel: "Cel",
    email: "E-mail",
    scanForCard: "Scannez pour ma carte de visite",
    flipHint: "Touchez la carte pour la retourner",
    saveContact: "Enregistrer le contact",
    downloadPng: "Télécharger en PNG",
    downloadJpeg: "Télécharger en JPEG",
  },
  en: {
    republic: "REPUBLIC OF CÔTE D'IVOIRE",
    motto: "Union – Discipline – Labour",
    tel: "Tel.",
    cel: "Cell",
    email: "Email",
    scanForCard: "Scan for my business card",
    flipHint: "Tap the card to flip it",
    saveContact: "Save contact",
    downloadPng: "Download as PNG",
    downloadJpeg: "Download as JPEG",
  },
};
