import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Plaidoyer — accueil">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v18M5 21h14M4 8l8-3 8 3M4 8l-2.5 6a3.5 3.5 0 0 0 5 0L4 8Zm16 0-2.5 6a3.5 3.5 0 0 0 5 0L20 8Z" stroke="#C9A24B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-serif text-xl tracking-wide">Plaidoyer</span>
    </Link>
  );
}

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-night/70 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ivory-muted md:flex">
          <a href="#etapes" className="transition hover:text-gold">Comment ça marche</a>
          <a href="#cas" className="transition hover:text-gold">Types de cas</a>
          <a href="#garanties" className="transition hover:text-gold">Garanties</a>
          <a href="#faq" className="transition hover:text-gold">FAQ</a>
        </nav>
        <Link href="/conversation" className="btn-ghost !px-5 !py-2">Commencer</Link>
      </div>
    </header>
  );
}
