import Link from "next/link";
import { Logo } from "./Nav";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-16">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-ivory-muted">
              Préparer sa défense écrite avec clarté, méthode et honnêteté.
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm text-ivory-muted">
            <Link href="/conversation" className="hover:text-gold">Préparer ma défense</Link>
            <Link href="/mentions-legales" className="hover:text-gold">Mentions légales</Link>
            <Link href="/mentions-legales#confidentialite" className="hover:text-gold">Confidentialité</Link>
          </nav>
        </div>
        <p className="mt-14 rounded-xl border border-gold/30 bg-gold/5 p-5 text-center text-sm text-gold-light">
          Ce service ne remplace pas un avocat.
        </p>
        <p className="mt-6 text-center text-xs text-ivory-muted">
          © {new Date().getFullYear()} Plaidoyer. Les textes générés sont des aides à la rédaction et ne constituent pas un conseil juridique.
        </p>
      </div>
    </footer>
  );
}
