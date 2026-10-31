export const STEPS = ["Raconter", "Documents", "Analyse", "Texte final"] as const;

export type Attachment = {
  id: string;
  name: string;
  kind: "pdf" | "image";
  /** aperçu local (data URL), non persisté */
  preview?: string;
  /** image réduite en base64 (JPEG), non persistée */
  imageB64?: string;
  /** texte extrait d'un PDF */
  text?: string;
  /** PDF scanné sans texte : envoyé tel quel à Claude */
  pdfB64?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

export type Fact = { label: string; value: string };

export type Dossier = {
  step: 1 | 2 | 3 | 4;
  facts: Fact[];
  lawyer?: string;
  draft?: string;
};

export type ChatResponse = {
  message: string;
  step: 1 | 2 | 3 | 4;
  facts: Fact[];
  lawyer_reason?: string;
  draft?: string;
  demo?: boolean;
};
