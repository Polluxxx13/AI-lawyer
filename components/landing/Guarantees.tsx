const items = [
  {
    t: "Confidentialité",
    d: "Votre dossier est chiffré dans votre navigateur. Nos serveurs ne conservent rien : un seul bouton suffit pour tout effacer.",
  },
  {
    t: "Faits réels uniquement",
    d: "L'assistant n'invente ni fait, ni témoin, ni preuve, ni article de loi. Chaque affirmation renvoie à votre récit ou à une pièce.",
  },
  {
    t: "Un avocat quand il le faut",
    d: "Risque pénal sérieux, montants élevés, enfants concernés : on vous le dit clairement et on vous oriente vers l'aide juridique.",
  },
];

export default function Guarantees() {
  return (
    <section id="garanties" className="section">
      <div className="container-x grid gap-16 lg:grid-cols-[1fr_1.4fr]">
        <div data-reveal>
          <p className="eyebrow mb-5">Garanties</p>
          <h2 className="h2">Sérieux, discret, honnête.</h2>
          <p className="mt-6 max-w-sm leading-relaxed text-ivory-muted">
            Une défense crédible repose sur la vérité. Plaidoyer ne vous conseillera jamais de mentir, de cacher une
            preuve ou de modifier un document.
          </p>
        </div>
        <ul data-stagger className="space-y-5">
          {items.map((g) => (
            <li key={g.t} className="card flex gap-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <div>
                <h3 className="font-serif text-2xl">{g.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{g.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
