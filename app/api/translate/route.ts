import { NextResponse } from "next/server";
import { translateFrenchToEnglish } from "@/lib/translate";

export async function POST(request: Request) {
  const body = (await request.json()) as { institution?: string; functionTitle?: string };

  const [institution, functionTitle] = await Promise.all([
    body.institution ? translateFrenchToEnglish(body.institution) : Promise.resolve(undefined),
    body.functionTitle ? translateFrenchToEnglish(body.functionTitle) : Promise.resolve(undefined),
  ]);

  return NextResponse.json({ institution, functionTitle });
}
