import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Cases from "@/components/landing/Cases";
import Guarantees from "@/components/landing/Guarantees";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import ScrollAnimations from "@/components/landing/ScrollAnimations";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Cases />
        <Guarantees />
        <Faq />
      </main>
      <Footer />
      <ScrollAnimations />
    </>
  );
}
