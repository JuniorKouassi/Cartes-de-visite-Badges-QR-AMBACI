import type { Staff } from "./staff";

function escapeVCardValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function buildVCard(staff: Staff, cardUrl: string): string {
  const [given, ...rest] = staff.full_name.trim().split(/\s+/);
  const family = rest.join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCardValue(family)};${escapeVCardValue(given ?? "")};;;`,
    `FN:${escapeVCardValue(staff.full_name)}`,
    `ORG:${escapeVCardValue(staff.institution)}`,
    `TITLE:${escapeVCardValue(staff.function_title)}`,
  ];

  if (staff.phone_office) lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCardValue(staff.phone_office)}`);
  if (staff.phone_cell) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(staff.phone_cell)}`);
  if (staff.email) lines.push(`EMAIL;TYPE=WORK:${escapeVCardValue(staff.email)}`);

  lines.push(`URL:${escapeVCardValue(cardUrl)}`);
  lines.push("END:VCARD");

  return lines.join("\r\n") + "\r\n";
}
