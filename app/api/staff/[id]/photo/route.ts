import { NextResponse } from "next/server";
import { getDb, getPhotosBucket } from "@/lib/db";
import { getStaffById, setStaffPhoto } from "@/lib/staff";
import { hasDepartment } from "@/lib/adminUsers";
import { getCurrentAdminUser } from "@/lib/authSession";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const db = getDb();
  if (!(await hasDepartment(db, user.id, "protocole"))) {
    return NextResponse.json({ error: "Accès non autorisé (Protocole)" }, { status: 403 });
  }

  const { id } = await params;
  const staffId = Number(id);

  const staff = await getStaffById(db, staffId);
  if (!staff) return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucune photo reçue" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 400 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `staff/${staffId}/photo.${extension}`;

  await getPhotosBucket().put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  await setStaffPhoto(db, staffId, key);

  return NextResponse.json({ photo_key: key });
}
