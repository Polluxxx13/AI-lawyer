import Link from "next/link";

const stats = [
  { n: 4, s: " étapes", l: "du récit au texte final" },
  { n: 100, s: " %", l: "de faits réels, jamais inventés" },
  { n: 5, s: " types", l: "de procédures couvertes" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
      <div data-parallax="0.25" className="pointer-events-none absolute inset-x-0 -top-20 h-[130%]" aria-hidden>
        <div className="absolute left-1/2 top-[18%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
        <svg className="absolute right-[-8%] top-[12%] w-[520px] opacity-[0.07]" viewBox="0 0 24 24" fill="none">
          <path d="M12 3v18M5 21h14M4 8l8-3 8 3M4 8l-2.5 6a3.5 3.5 0 0 0 5 0L4 8Zm16 0-2.5 6a3.5 3.5 0 0 0 5 0L20 8Z" stroke="#C9A24B" strokeWidth="0.4" />
        </svg>
      </div>

      <div className="container-x relative py-20">
        <p data-reveal className="eyebrow mb-8">Assistant juridique · Défense écrite</p>
        <h1 data-reveal className="max-w-4xl font-serif text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-7xl">
          Votre défense, <span className="italic text-gold">bien dite</span>, enfin bien écrite.
        </h1>
        <p data-reveal className="mt-8 max-w-xl text-lg leading-relaxed text-ivory-muted">
          Lettre au juge, recours, opposition, mémoire : racontez votre situation, Plaidoyer vous aide à
          construire un texte clair, structuré et fidèle aux faits.
        </p>
        <div data-reveal className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/conversation" className="btn-gold">Préparer ma défense →</Link>
          <a href="#etapes" className="btn-ghost">Voir comment ça marche</a>
        </div>

        <dl data-stagger className="mt-24 grid max-w-3xl grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.l}>
              <dt className="font-serif text-4xl text-gold">
                <span data-count={s.n} data-suffix={s.s}>0</span>
              </dt>
              <dd className="mt-2 text-sm text-ivory-muted">{s.l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
