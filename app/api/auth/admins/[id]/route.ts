import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/authSession";
import { countAdminUsers, deleteAdminUser, getAdminUserById, isDepartment, setAdminDepartments } from "@/lib/adminUsers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const targetId = Number(id);

  const { env } = getCloudflareContext();
  const target = await getAdminUserById(env.DB, targetId);
  if (!target) {
    return NextResponse.json({ error: "Administrateur introuvable" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { departments?: string[] } | null;
  const departments = (body?.departments ?? []).filter(isDepartment);
  if (departments.length === 0) {
    return NextResponse.json({ error: "Sélectionnez au moins un département" }, { status: 400 });
  }

  await setAdminDepartments(env.DB, targetId, departments);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const targetId = Number(id);

  if (targetId === user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas retirer votre propre compte" }, { status: 400 });
  }

  const { env } = getCloudflareContext();

  const target = await getAdminUserById(env.DB, targetId);
  if (!target) {
    return NextResponse.json({ error: "Administrateur introuvable" }, { status: 404 });
  }

  const count = await countAdminUsers(env.DB);
  if (count <= 1) {
    return NextResponse.json({ error: "Impossible de retirer le dernier administrateur" }, { status: 400 });
  }

  await deleteAdminUser(env.DB, targetId);
  return NextResponse.json({ ok: true });
}
