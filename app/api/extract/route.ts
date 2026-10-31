import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;

/** Extrait le texte d'un PDF en mémoire. Rien n'est écrit sur disque ni conservé. */
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (12 Mo max)." }, { status: 413 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "PDF attendu." }, { status: 415 });

  try {
    // import direct : l'entrée racine de pdf-parse 1.1.1 exécute un fichier de test au chargement
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdfParse(Buffer.from(await file.arrayBuffer()));
    const text = (data.text || "").replace(/\n{3,}/g, "\n\n").trim();
    return NextResponse.json({ text, pages: data.numpages, scanned: text.length < 10 });
  } catch {
    return NextResponse.json({ error: "Lecture du PDF impossible." }, { status: 422 });
  }
}
