import { EB_Garamond, Archivo, Archivo_Narrow, DM_Sans, Dancing_Script } from "next/font/google";

export const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-archivo",
});

export const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-archivo-narrow",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-dancing-script",
});
