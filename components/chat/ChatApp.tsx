"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/landing/Nav";
import { STEPS, type Attachment, type ChatResponse, type Dossier, type Message } from "@/lib/types";
import { loadVault, saveVault, wipeVault } from "@/lib/vault";
import { processFile } from "@/lib/files";
import { exportPdf, exportWord } from "@/lib/export";

const GREETING: Message = {
  id: "hello",
  role: "assistant",
  content:
    "Bonjour. Je vais vous aider à préparer votre défense écrite, à partir de faits réels uniquement. Prenons le temps : de quel type d'affaire s'agit-il, dans quel pays ou canton, et y a-t-il une date limite pour répondre ?",
};
const EMPTY: Dossier = { step: 1, facts: [] };
const uid = () => Math.random().toString(36).slice(2, 10);

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [dossier, setDossier] = useState<Dossier>(EMPTY);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const [drag, setDrag] = useState(false);
  const [panel, setPanel] = useState(false);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState<"" | "pdf" | "word">("");
  const scroller = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Restauration du dossier chiffré
  useEffect(() => {
    loadVault<{ messages: Message[]; dossier: Dossier }>().then((v) => {
      if (v?.messages?.length) {
        setMessages(v.messages);
        setDossier(v.dossier);
      }
      setReady(true);
    });
  }, []);

  // Sauvegarde chiffrée (sans aperçus ni images brutes)
  useEffect(() => {
    if (!ready) return;
    const lean = messages.map((m) => ({
      ...m,
      attachments: m.attachments?.map(({ id, name, kind, text }) => ({ id, name, kind, text })),
    }));
    saveVault({ messages: lean, dossier }).catch(() => {});
  }, [messages, dossier, ready]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError("");
    setUploading(true);
    for (const f of Array.from(files)) {
      try {
        const att = await processFile(f);
        setPending((p) => [...p, att]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Fichier illisible.");
      }
    }
    setUploading(false);
  }, []);

  async function send() {
    const text = input.trim();
    if ((!text && pending.length === 0) || busy || uploading) return;
    const userMsg: Message = { id: uid(), role: "user", content: text, attachments: pending.length ? pending : undefined };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending([]);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data: ChatResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inattendue.");
      setDemo(!!data.demo);
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: data.message }]);
      setDossier((d) => ({
        step: data.step,
        facts: data.facts ?? d.facts,
        lawyer: data.lawyer_reason || d.lawyer,
        draft: data.draft ?? d.draft,
      }));
      if (data.draft) setPanel(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  async function wipe() {
    if (!confirm("Supprimer définitivement la conversation, les documents et le texte de ce navigateur ?")) return;
    setReady(false);
    await wipeVault();
    setMessages([GREETING]);
    setDossier(EMPTY);
    setPending([]);
    setInput("");
    setReady(true);
  }

  async function doExport(kind: "pdf" | "word") {
    if (!dossier.draft) return;
    setExporting(kind);
    try {
      await (kind === "pdf" ? exportPdf(dossier.draft) : exportWord(dossier.draft));
    } finally {
      setExporting("");
    }
  }

  const progress = dossier.step;

  return (
    <div
      className="flex h-[100dvh] flex-col"
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
    >
      {/* En-tête + progression */}
      <header className="border-b border-white/10 bg-night/80 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <button onClick={() => setPanel(true)} className="btn-ghost !px-4 !py-1.5 text-xs lg:hidden">Résumé</button>
            <button onClick={wipe} className="btn-ghost !px-4 !py-1.5 text-xs hover:!border-red-400/60 hover:!text-red-300">
              Supprimer mes données
            </button>
          </div>
        </div>
        <ol className="grid grid-cols-4 gap-2 px-4 pb-3 sm:px-6" aria-label="Progression">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < progress ? "done" : n === progress ? "current" : "todo";
            return (
              <li key={s} aria-current={state === "current" ? "step" : undefined}>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gold transition-all duration-700 ${state === "todo" ? "w-0" : state === "current" ? "w-1/2" : "w-full"}`}
                  />
                </div>
                <span className={`mt-1.5 block truncate text-[11px] uppercase tracking-wider ${state === "todo" ? "text-ivory-muted/60" : "text-gold"}`}>
                  {n}. {s}
                </span>
              </li>
            );
          })}
        </ol>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Colonne principale */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          {drag && (
            <div className="absolute inset-3 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-gold bg-night/90 text-gold">
              Déposez vos documents ici (PDF, images, photos)
            </div>
          )}

          <div ref={scroller} className="scroll-thin flex-1 overflow-y-auto px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-2xl space-y-6">
              {demo && (
                <p className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-2 text-xs text-gold-light">
                  Mode démonstration : aucune clé ANTHROPIC_API_KEY configurée.
                </p>
              )}
              {messages.map((m) => (
                <Bubble key={m.id} m={m} />
              ))}
              {busy && (
                <div className="flex gap-1.5 pl-1" aria-label="L'assistant rédige">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-gold/70" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}

              {dossier.draft && (
                <DraftEditor
                  value={dossier.draft}
                  onChange={(v) => setDossier((d) => ({ ...d, draft: v }))}
                  onExport={doExport}
                  exporting={exporting}
                />
              )}
            </div>
          </div>

          {/* Saisie */}
          <div className="border-t border-white/10 bg-night/80 px-4 py-4 backdrop-blur sm:px-8">
            <div className="mx-auto max-w-2xl">
              {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}
              {(pending.length > 0 || uploading) && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {pending.map((a) => (
                    <li key={a.id} className="group relative flex items-center gap-2 rounded-lg border border-white/10 bg-night-700 p-1.5 pr-3 text-xs">
                      {a.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.preview} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded bg-gold/15 text-[10px] font-semibold text-gold">PDF</span>
                      )}
                      <span className="max-w-[9rem] truncate">{a.name}</span>
                      <button
                        onClick={() => setPending((p) => p.filter((x) => x.id !== a.id))}
                        className="ml-1 text-ivory-muted hover:text-red-300"
                        aria-label={`Retirer ${a.name}`}
                      >×</button>
                    </li>
                  ))}
                  {uploading && <li className="flex items-center px-2 text-xs text-gold">Lecture du document…</li>}
                </ul>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-night-700 p-2 focus-within:border-gold/60">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ivory-muted transition hover:bg-white/5 hover:text-gold"
                  aria-label="Ajouter un document"
                  title="Ajouter un document"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.5 12.5 21a5.5 5.5 0 0 1-8-8L13 4.5a3.7 3.7 0 0 1 5.3 5.3L9.8 18.3a1.9 1.9 0 0 1-2.7-2.7L15 7.8" /></svg>
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  hidden
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
                />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder="Écrivez votre message…"
                  className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-ivory-muted/60"
                />
                <button
                  onClick={send}
                  disabled={busy || uploading || (!input.trim() && pending.length === 0)}
                  className="btn-gold !px-5 !py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Envoyer
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-ivory-muted/70">
                Ce service ne remplace pas un avocat. Vous restez responsable du texte envoyé.
              </p>
            </div>
          </div>
        </main>

        {/* Résumé des faits : colonne fixe sur grand écran, tiroir sur mobile */}
        <aside
          className={`${panel ? "fixed inset-0 z-30 flex" : "hidden"} lg:static lg:z-auto lg:flex lg:w-80 lg:shrink-0 xl:w-96`}
        >
          <button className="flex-1 bg-black/60 lg:hidden" onClick={() => setPanel(false)} aria-label="Fermer" />
          <FactsPanel dossier={dossier} onClose={() => setPanel(false)} />
        </aside>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: Message }) {
  const mine = m.role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
          mine ? "rounded-br-sm bg-gold/90 text-night" : "rounded-bl-sm border border-white/10 bg-night-700/80"
        }`}
      >
        {m.attachments && m.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {m.attachments.map((a) =>
              a.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.id} src={a.preview} alt={a.name} className="h-20 w-20 rounded-lg object-cover" />
              ) : (
                <span key={a.id} className="rounded-md bg-black/15 px-2 py-1 text-xs">📄 {a.name}</span>
              ),
            )}
          </div>
        )}
        {m.content}
      </div>
    </div>
  );
}

function FactsPanel({ dossier, onClose }: { dossier: Dossier; onClose: () => void }) {
  return (
    <div className="scroll-thin flex w-[88%] max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-night-800 p-6 lg:w-full lg:max-w-none">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Résumé des faits</h2>
        <button onClick={onClose} className="text-2xl leading-none text-ivory-muted lg:hidden" aria-label="Fermer">×</button>
      </div>
      {dossier.lawyer && (
        <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed text-gold-light">
          <strong className="block font-semibold text-gold">Avocat recommandé</strong>
          {dossier.lawyer}
        </div>
      )}
      {dossier.facts.length === 0 ? (
        <p className="mt-6 text-sm leading-relaxed text-ivory-muted">
          Les faits apparaîtront ici au fil de la conversation, afin que vous puissiez les vérifier.
        </p>
      ) : (
        <dl className="mt-6 space-y-4">
          {dossier.facts.map((f, i) => (
            <div key={`${f.label}-${i}`} className="border-l-2 border-gold/50 pl-3">
              <dt className="text-[11px] uppercase tracking-wider text-gold">{f.label}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function DraftEditor({
  value, onChange, onExport, exporting,
}: {
  value: string;
  onChange: (v: string) => void;
  onExport: (k: "pdf" | "word") => void;
  exporting: "" | "pdf" | "word";
}) {
  return (
    <section className="rounded-2xl border border-gold/40 bg-night-800 p-5 sm:p-7" aria-label="Texte généré">
      <p className="eyebrow">Aperçu du texte final</p>
      <p className="mt-2 text-sm text-ivory-muted">
        Relisez chaque phrase, complétez les passages entre crochets et corrigez ce qui ne correspond pas exactement aux faits.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        className="scroll-thin mt-5 h-[28rem] w-full resize-y rounded-xl bg-[#F6F2E9] p-6 font-serif text-[15px] leading-7 text-[#1b1b1b] outline-none focus:ring-2 focus:ring-gold"
      />
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => onExport("pdf")} disabled={!!exporting} className="btn-gold">
          {exporting === "pdf" ? "Export…" : "Exporter en PDF"}
        </button>
        <button onClick={() => onExport("word")} disabled={!!exporting} className="btn-ghost">
          {exporting === "word" ? "Export…" : "Exporter en Word"}
        </button>
        <Link href="/mentions-legales" className="ml-auto self-center text-xs text-ivory-muted hover:text-gold">Avertissement</Link>
      </div>
    </section>
  );
}
