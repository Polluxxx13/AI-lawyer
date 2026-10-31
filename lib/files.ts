import type { Attachment } from "./types";

const MAX_PDF_B64 = 8 * 1024 * 1024;
const uid = () => Math.random().toString(36).slice(2, 10);

function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function processImage(file: File): Promise<Attachment> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return { id: uid(), name: file.name, kind: "image", preview: url, imageB64: url.split(",")[1] };
}

async function processPdf(file: File): Promise<Attachment> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/extract", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Lecture du PDF impossible.");
  const att: Attachment = { id: uid(), name: file.name, kind: "pdf", text: data.text };
  if (data.scanned) {
    const b64 = (await readAsDataURL(file)).split(",")[1];
    if (b64.length > MAX_PDF_B64) throw new Error("PDF scanné trop volumineux (6 Mo max).");
    att.pdfB64 = b64;
    att.text = undefined;
  }
  return att;
}

export async function processFile(file: File): Promise<Attachment> {
  if (file.type === "application/pdf") return processPdf(file);
  if (file.type.startsWith("image/")) return processImage(file);
  throw new Error(`Format non pris en charge : ${file.name}`);
}
