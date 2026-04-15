import { Shield, Leaf, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeatureCards() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-2 gap-5">

          <motion.div
            className="card-lift bg-gray-950 text-white rounded-2xl p-7 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="w-8 h-8 text-green-400 mb-5" strokeWidth={1.6} />
            <h3 className="text-xl font-bold tracking-tight">Your data never leaves Bhutan</h3>
            <p className="mt-2 text-base text-gray-300 leading-relaxed">
              Every byte is hosted on MoH-controlled servers inside the country.
              End-to-end encrypted, fully auditable, and aligned with the 13th
              Five-Year Plan's data sovereignty goals.
            </p>
            <a href="#" className="inline-flex items-center gap-1 text-green-400 text-[15px] font-medium mt-5 hover:text-green-300 transition-colors">
              Read the security brief <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <motion.div
            className="card-lift bg-white border border-gray-200/60 rounded-2xl p-7 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Leaf className="w-8 h-8 text-green-600 mb-5" strokeWidth={1.6} />
            <h3 className="text-xl font-bold tracking-tight">Sowa Rigpa, not sidelined</h3>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">
              Traditional medicine practitioners issue digital prescriptions through
              the same system. Drug-herb interaction checks run automatically so
              patients on both systems stay safe.
            </p>
            <a href="#" className="inline-flex items-center gap-1 text-green-600 text-[15px] font-medium mt-5 hover:underline">
              How integration works <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
