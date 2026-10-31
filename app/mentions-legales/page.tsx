import Link from "next/link";

export const metadata = { title: "Mentions légales — Plaidoyer" };

export default function Mentions() {
  return (
    <main className="container-x max-w-3xl py-24">
      <Link href="/" className="text-sm text-gold hover:underline">← Retour</Link>
      <h1 className="mt-8 font-serif text-4xl">Mentions légales</h1>
      <div className="mt-10 space-y-8 leading-relaxed text-ivory-muted">
        <section>
          <h2 className="font-serif text-2xl text-ivory">Nature du service</h2>
          <p className="mt-3">
            Plaidoyer est un outil d&apos;aide à la rédaction fondé sur l&apos;intelligence artificielle. Ce service ne
            remplace pas un avocat. Il ne fournit pas de conseil juridique personnalisé : l&apos;utilisateur reste seul
            responsable du contenu et de l&apos;envoi des textes produits, et doit vérifier les règles de droit et les
            délais applicables auprès de l&apos;autorité compétente.
          </p>
        </section>
        <section id="confidentialite">
          <h2 className="font-serif text-2xl text-ivory">Confidentialité et données</h2>
          <p className="mt-3">
            Le dossier est conservé uniquement dans votre navigateur, sous forme chiffrée (AES-GCM). Les messages et
            documents sont transmis à notre serveur puis à l&apos;API d&apos;Anthropic uniquement pour produire une
            réponse ; le serveur n&apos;en conserve aucune copie. Vous pouvez supprimer l&apos;ensemble de vos données à
            tout moment depuis l&apos;espace de conversation.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-ivory">Éditeur</h2>
          <p className="mt-3">À compléter : raison sociale, adresse, contact, hébergeur.</p>
        </section>
      </div>
    </main>
  );
}
