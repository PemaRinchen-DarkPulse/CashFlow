import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function CtaBanner() {
  return (
    <section id="contact" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] gradient-primary p-10 text-primary-foreground shadow-elegant sm:p-16">
            <div
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
                  Join the health revolution
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Step into integrated healthcare.
                </h2>
                <p className="mt-4 max-w-xl text-sm opacity-90 sm:text-base">
                  Whether you're a patient, doctor, or pharmacist — AiMedicare Bhutan brings the whole care ecosystem to your fingertips.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-foreground shadow-elegant hover:bg-background/90"
                >
                  <a href="#home" className="group">
                    Get Started Now
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <a href="#services">View Services</a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
