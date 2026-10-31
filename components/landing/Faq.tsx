"use client";

import { useState } from "react";

const faqs = [
  { q: "Plaidoyer remplace-t-il un avocat ?", a: "Non. Plaidoyer vous aide à structurer et rédiger votre défense, mais ne remplace pas un avocat. Vous restez responsable du texte que vous envoyez. Pour les affaires graves, consultez un professionnel." },
  { q: "Mes données sont-elles protégées ?", a: "Votre dossier est chiffré (AES-GCM) dans votre navigateur. Les échanges transitent par nos serveurs uniquement le temps de la réponse de l'IA, sans être enregistrés. Vous pouvez tout supprimer à tout moment." },
  { q: "Quels documents puis-je ajouter ?", a: "Des PDF, des images et des photos (décision, amende, contrat, courriers, SMS, factures). Le texte des PDF est extrait ; les images et scans sont analysés par l'IA." },
  { q: "L'IA peut-elle inventer des éléments ?", a: "Elle a pour consigne stricte de ne jamais inventer de faits, de preuves ou de citations de loi, et de signaler quand une règle doit être vérifiée. Relisez toujours le texte final." },
  { q: "Quels pays sont couverts ?", a: "L'assistant vous demande d'abord le pays ou le canton concerné et adapte ses questions. Les règles de droit varient : vérifiez toujours les délais et références auprès de l'autorité." },
  { q: "Comment récupérer mon texte ?", a: "À la fin, un aperçu modifiable s'affiche. Vous pouvez l'ajuster puis l'exporter en PDF ou en document Word." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section bg-night-800/60">
      <div className="container-x max-w-3xl">
        <div data-reveal>
          <p className="eyebrow mb-5">FAQ</p>
          <h2 className="h2">Questions fréquentes</h2>
        </div>
        <div data-stagger className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-xl transition hover:text-gold"
                  >
                    {f.q}
                    <span className={`shrink-0 text-2xl text-gold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  role="region"
                  className={`grid transition-all duration-500 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 leading-relaxed text-ivory-muted">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
