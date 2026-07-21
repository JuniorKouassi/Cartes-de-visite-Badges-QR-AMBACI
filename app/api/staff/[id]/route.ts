import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateStaff, type StaffInput } from "@/lib/staff";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as Partial<StaffInput>;

  if (!body.full_name?.trim() || !body.function_title?.trim()) {
    return NextResponse.json({ error: "Nom complet et fonction sont requis" }, { status: 400 });
  }

  const staff = await updateStaff(getDb(), Number(id), body as StaffInput);
  if (!staff) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

  return NextResponse.json(staff);
}
