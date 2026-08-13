import { NextResponse } from "next/server";
import { getDb, getPhotosBucket } from "@/lib/db";
import { deleteConsularHolder, updateConsularHolder, type ConsularHolderInput } from "@/lib/consularHolders";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "consulaire"))) {
    return NextResponse.json({ error: "Accès non autorisé (Service consulaire)" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as Partial<ConsularHolderInput>;

  if (!body.last_name?.trim() || !body.first_names?.trim()) {
    return NextResponse.json({ error: "Nom et prénoms sont requis" }, { status: 400 });
  }

  const holder = await updateConsularHolder(db, Number(id), body as ConsularHolderInput);
  if (!holder) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

  return NextResponse.json(holder);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "consulaire"))) {
    return NextResponse.json({ error: "Accès non autorisé (Service consulaire)" }, { status: 403 });
  }

  const { id } = await params;
  const holder = await deleteConsularHolder(db, Number(id));
  if (!holder) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

  if (holder.photo_key) {
    await getPhotosBucket().delete(holder.photo_key);
  }

  return NextResponse.json({ ok: true });
}
