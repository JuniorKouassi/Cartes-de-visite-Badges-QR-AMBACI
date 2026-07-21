import { notFound } from "next/navigation";
import { getPhotosBucket } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const object = await getPhotosBucket().get(key.join("/"));
  if (!object) notFound();

  return new Response(object.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
      ETag: object.httpEtag,
    },
  });
}
