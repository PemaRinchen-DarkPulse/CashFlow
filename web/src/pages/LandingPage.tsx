import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { About } from "@/components/landing/About";
import { Testimonials } from "@/components/landing/Testimonials";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/Footer";
import { PageLoader } from "@/components/landing/PageLoader";

export default function LandingPage() {
  return (
    <>
      <PageLoader />
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <Navbar />
        <main>
          <Hero />
          <Services />
          <HowItWorks />
          <Stats />
          <About />
          <Testimonials />
          <CtaBanner />
        </main>
        <Footer />
      </div>
    </>
  );
}