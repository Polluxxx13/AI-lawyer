const steps = [
  { t: "Raconter", d: "Vous exposez votre situation à votre rythme. L'assistant pose les questions une par une : qui, quoi, quand, où, quels délais." },
  { t: "Documents", d: "Décision, contrat, courriers, SMS, photos : déposez vos pièces. Le texte est extrait, les images sont analysées." },
  { t: "Analyse", d: "Arguments favorables, vices de procédure, points faibles et manière de les traiter, avec honnêteté." },
  { t: "Texte final", d: "Un texte structuré, relié à vos pièces numérotées. Vous le relisez, le modifiez, l'exportez en PDF ou Word." },
];

export default function HowItWorks() {
  return (
    <section id="etapes" className="section">
      <div className="container-x">
        <div data-reveal className="max-w-2xl">
          <p className="eyebrow mb-5">Comment ça marche</p>
          <h2 className="h2">Quatre étapes, une défense construite avec méthode.</h2>
        </div>

        <div className="relative mt-20">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-white/10 lg:block" />
          <div data-line className="absolute left-0 right-0 top-5 hidden h-px bg-gold lg:block" />
          <ol data-stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.t} className="card relative lg:mt-10">
                <span className="absolute -top-[3.1rem] left-7 hidden h-3 w-3 rounded-full bg-gold ring-8 ring-night lg:block" />
                <span className="font-serif text-5xl text-gold/40">0{i + 1}</span>
                <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
