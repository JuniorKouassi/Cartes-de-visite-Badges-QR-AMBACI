import { getAi } from "./db";

// The translation model mistranslates this proper noun into other Romance
// languages (e.g. Spanish "Costa de Marfil") if left unprotected.
const PROTECTED_TERM = "Côte d'Ivoire";
const PLACEHOLDER = "XIVOIREX";

export async function translateFrenchToEnglish(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const ai = getAi();
  const result = await ai.run("@cf/meta/m2m100-1.2b", {
    text: trimmed.split(PROTECTED_TERM).join(PLACEHOLDER),
    source_lang: "french",
    target_lang: "english",
  });

  const translated = (result as { translated_text?: string }).translated_text?.trim();
  if (!translated) return text;

  return translated.split(PLACEHOLDER).join(PROTECTED_TERM);
}
