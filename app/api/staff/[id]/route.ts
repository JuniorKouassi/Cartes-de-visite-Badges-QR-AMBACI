import { NextResponse } from "next/server";
import { getDb, getPhotosBucket } from "@/lib/db";
import { deleteStaff, updateStaff, type StaffInput } from "@/lib/staff";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "protocole"))) {
    return NextResponse.json({ error: "Accès non autorisé (Protocole)" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as Partial<StaffInput>;

  if (!body.full_name?.trim() || !body.function_title?.trim()) {
    return NextResponse.json({ error: "Nom complet et fonction sont requis" }, { status: 400 });
  }

  const staff = await updateStaff(db, Number(id), body as StaffInput);
  if (!staff) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

  return NextResponse.json(staff);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "protocole"))) {
    return NextResponse.json({ error: "Accès non autorisé (Protocole)" }, { status: 403 });
  }

  const { id } = await params;
  const staff = await deleteStaff(db, Number(id));
  if (!staff) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

  if (staff.photo_key) {
    await getPhotosBucket().delete(staff.photo_key);
  }

  return NextResponse.json({ ok: true });
}
