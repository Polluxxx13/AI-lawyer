const cases = [
  { t: "Amendes", d: "Contester une amende ou une contravention : vice de forme, signalisation, circonstances.", icon: "M4 6h16M4 12h16M4 18h10" },
  { t: "Litiges de bail", d: "Charges, état des lieux, congé, résiliation, dépôt de garantie non restitué.", icon: "M3 11l9-7 9 7v9H3z M9 20v-6h6v6" },
  { t: "Droit du travail", d: "Licenciement, salaire impayé, certificat de travail, avertissement contesté.", icon: "M4 8h16v11H4z M9 8V5h6v3" },
  { t: "Oppositions", d: "Opposition à une ordonnance pénale, à un commandement de payer ou à une décision.", icon: "M12 4l8 14H4z M12 10v4" },
  { t: "Recours administratifs", d: "Décision d'une administration, d'une assurance ou d'une commune : délais et motifs.", icon: "M5 4h14v16H5z M9 9h6 M9 13h6" },
];

export default function Cases() {
  return (
    <section id="cas" className="section bg-night-800/60">
      <div className="container-x">
        <div data-reveal className="max-w-2xl">
          <p className="eyebrow mb-5">Types de cas</p>
          <h2 className="h2">Les situations du quotidien où l&apos;on se retrouve seul face à un texte officiel.</h2>
        </div>
        <ul data-stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <li key={c.t} className="card">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#C9A24B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={c.icon} />
              </svg>
              <h3 className="mt-6 font-serif text-2xl">{c.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory-muted">{c.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
