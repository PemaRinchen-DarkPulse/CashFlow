import { Shield, Leaf, ArrowUpRight } from 'lucide-react';

export default function FeatureCards() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-2 gap-5">

          <div className="card-lift bg-white border border-gray-100 rounded-2xl p-7 md:p-8">
            <Shield className="w-8 h-8 text-green-600 mb-5" strokeWidth={1.6} />
            <h3 className="text-xl font-bold tracking-tight">Your data never leaves Bhutan</h3>
            <p className="mt-2 text-base text-gray-500 leading-relaxed">
              Every byte is hosted on MoH-controlled servers inside the country.
              End-to-end encrypted, fully auditable, and aligned with the 13th
              Five-Year Plan's data sovereignty goals.
            </p>
            <a href="#" className="inline-flex items-center gap-1 text-green-600 text-[15px] font-medium mt-5 hover:underline">
              Read the security brief <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="card-lift bg-white border border-gray-100 rounded-2xl p-7 md:p-8">
            <Leaf className="w-8 h-8 text-green-600 mb-5" strokeWidth={1.6} />
            <h3 className="text-xl font-bold tracking-tight">Sowa Rigpa, not sidelined</h3>
            <p className="mt-2 text-base text-gray-500 leading-relaxed">
              Traditional medicine practitioners issue digital prescriptions through
              the same system. Drug-herb interaction checks run automatically so
              patients on both systems stay safe.
            </p>
            <a href="#" className="inline-flex items-center gap-1 text-green-600 text-[15px] font-medium mt-5 hover:underline">
              How integration works <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
