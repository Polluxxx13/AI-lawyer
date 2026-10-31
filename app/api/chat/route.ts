import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ChatResponse, Message } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const OUTPUT_RULES = `

CONSIGNES TECHNIQUES DE L'INTERFACE
Tu réponds TOUJOURS en appelant l'outil "repondre". Champs :
- message : ta réponse à la personne (une seule question à la fois à l'étape 1, ton calme et rassurant).
- step : étape actuelle (1 = Raconter, 2 = Documents, 3 = Analyse, 4 = Texte final).
- facts : liste COMPLÈTE et à jour du résumé des faits (label court + valeur), cumulative d'un tour à l'autre : type d'affaire, juridiction/pays, délai, chronologie, parties, pièces, arguments retenus, points faibles. Uniquement ce qui a été dit ou prouvé.
- lawyer_reason : renseigne-le si l'affaire justifie de consulter un avocat (sinon omets-le).
- draft : le texte complet de la défense, seulement quand tu passes à l'étape 4 (ou le mets à jour). Texte brut, sans markdown, sans liste à puces, avec des paragraphes séparés par une ligne vide. Les éléments que la personne n'a pas fournis (nom, adresse, numéro de dossier) restent entre crochets [À COMPLÉTER].
Les documents joints apparaissent dans la conversation sous forme de « Pièce n » : cite-les ainsi.`;

const tool: Anthropic.Tool = {
  name: "repondre",
  description: "Répond à l'utilisateur et met à jour le dossier.",
  input_schema: {
    type: "object",
    properties: {
      message: { type: "string" },
      step: { type: "integer", enum: [1, 2, 3, 4] },
      facts: {
        type: "array",
        items: {
          type: "object",
          properties: { label: { type: "string" }, value: { type: "string" } },
          required: ["label", "value"],
        },
      },
      lawyer_reason: { type: "string" },
      draft: { type: "string" },
    },
    required: ["message", "step", "facts"],
  },
};

async function systemPrompt() {
  const base = await readFile(path.join(process.cwd(), "prompts", "system.md"), "utf8");
  return base + OUTPUT_RULES;
}

function toClaudeMessages(messages: Message[]): Anthropic.MessageParam[] {
  let piece = 0;
  return messages.map((m) => {
    if (m.role === "assistant") return { role: "assistant", content: m.content };
    const blocks: Anthropic.ContentBlockParam[] = [];
    for (const a of m.attachments ?? []) {
      piece += 1;
      const label = `Pièce ${piece} — ${a.name}`;
      if (a.kind === "image" && a.imageB64) {
        blocks.push({ type: "text", text: `[${label}] (image jointe) :` });
        blocks.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: a.imageB64 } });
      } else if (a.kind === "pdf" && a.pdfB64) {
        blocks.push({ type: "text", text: `[${label}] (PDF scanné) :` });
        blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: a.pdfB64 } });
      } else if (a.kind === "pdf" && a.text) {
        blocks.push({ type: "text", text: `[${label}] — texte extrait du PDF :\n${a.text.slice(0, 40000)}` });
      } else {
        blocks.push({ type: "text", text: `[${label}] (contenu non disponible)` });
      }
    }
    blocks.push({ type: "text", text: m.content || "(document joint)" });
    return { role: "user", content: blocks };
  });
}

/** Réponses scriptées quand aucune clé API n'est configurée. */
function demo(messages: Message[]): ChatResponse {
  const n = messages.filter((m) => m.role === "user").length;
  const hasDoc = messages.some((m) => m.attachments?.length);
  const facts = [
    { label: "Mode", value: "démonstration (aucune clé API configurée)" },
    ...messages.filter((m) => m.role === "user").slice(0, 4).map((m, i) => ({ label: `Élément ${i + 1}`, value: m.content.slice(0, 140) || "Document joint" })),
  ];
  if (n <= 1) return { demo: true, step: 1, facts, message: "Bonjour, je suis là pour vous aider à préparer votre défense. Commençons calmement : de quel type d'affaire s'agit-il (amende, bail, travail, opposition, recours), dans quel pays ou canton, et existe-t-il un délai pour répondre ?" };
  if (n === 2) return { demo: true, step: 2, facts, message: "Merci, c'est clair. Avez-vous reçu une décision ou un courrier officiel ? Vous pouvez le déposer ici (PDF ou photo), ainsi que tout autre document utile : contrat, e-mails, SMS, photos." };
  if (n === 3) return { demo: true, step: 3, facts, lawyer_reason: undefined, message: `${hasDoc ? "J'ai bien reçu vos documents. " : ""}Voici l'analyse : je relève vos arguments favorables, ainsi que les points faibles à traiter honnêtement. Souhaitez-vous que je rédige le texte final ?` };
  return {
    demo: true, step: 4, facts,
    message: "Voici une première version de votre texte. Relisez-la, modifiez-la directement dans l'aperçu, puis exportez-la en PDF ou Word.",
    draft: "[Prénom NOM]\n[Adresse]\n\n[Autorité destinataire]\n[Adresse]\n\n[Lieu], le [date]\n\nObjet : [type de recours] — dossier n° [À COMPLÉTER]\n\nMadame, Monsieur,\n\nJe me permets de vous écrire au sujet de la décision du [date], reçue le [date] (pièce 1).\n\nCeci est un texte de démonstration : configurez ANTHROPIC_API_KEY pour obtenir une rédaction fondée sur vos faits réels.\n\nJe vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.\n\n[Signature]",
  };
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Message[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json(demo(messages));

  try {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 6000,
      system: await systemPrompt(),
      tools: [tool],
      tool_choice: { type: "tool", name: "repondre" },
      messages: toClaudeMessages(messages),
    });
    const block = res.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") throw new Error("Réponse vide");
    return NextResponse.json(block.input as ChatResponse);
  } catch (e) {
    console.error("chat error", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "L'assistant est momentanément indisponible. Réessayez dans un instant." }, { status: 502 });
  }
}
