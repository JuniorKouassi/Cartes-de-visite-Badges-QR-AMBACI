import QRCode from "qrcode";

export async function generateQrPng(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 600,
    color: {
      dark: "#0A1F10",
      light: "#FFFFFF",
    },
  });
}
