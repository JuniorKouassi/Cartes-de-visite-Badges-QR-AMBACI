import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createStaff, type StaffInput } from "@/lib/staff";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "protocole"))) {
    return NextResponse.json({ error: "Accès non autorisé (Protocole)" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<StaffInput>;

  if (!body.full_name?.trim() || !body.function_title?.trim()) {
    return NextResponse.json({ error: "Nom complet et fonction sont requis" }, { status: 400 });
  }

  try {
    const staff = await createStaff(db, body as StaffInput);
    return NextResponse.json(staff, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
