import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createConsularHolder, type ConsularHolderInput } from "@/lib/consularHolders";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "consulaire"))) {
    return NextResponse.json({ error: "Accès non autorisé (Service consulaire)" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<ConsularHolderInput>;

  if (!body.last_name?.trim() || !body.first_names?.trim()) {
    return NextResponse.json({ error: "Nom et prénoms sont requis" }, { status: 400 });
  }

  try {
    const holder = await createConsularHolder(db, body as ConsularHolderInput);
    return NextResponse.json(holder, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
