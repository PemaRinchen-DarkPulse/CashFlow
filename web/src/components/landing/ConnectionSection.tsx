import { Stethoscope, User, Pill } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConnectionSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* diagram */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" fill="none">
                {/* triangle edges */}
                <path d="M160 55 L60 248 L260 248 Z" stroke="#d1d5db" strokeWidth="1" fill="none" strokeDasharray="5 5" />
                {/* spokes to center */}
                <line x1="160" y1="70" x2="160" y2="130" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
                <line x1="72" y1="240" x2="130" y2="185" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
                <line x1="248" y1="240" x2="190" y2="185" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
              </svg>

              {/* center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-md z-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>

              {/* nodes */}
              {[
                { Icon: Stethoscope, label: 'Providers', cls: 'top-0 left-1/2 -translate-x-1/2' },
                { Icon: User, label: 'Patients', cls: 'bottom-0 left-3' },
                { Icon: Pill, label: 'Pharmacy', cls: 'bottom-0 right-3' },
              ].map(n => (
                <div key={n.label} className={`absolute ${n.cls} flex flex-col items-center`}>
                  <div className="w-12 h-12 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center">
                    <n.Icon className="w-5 h-5 text-green-700" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 mt-1">{n.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* copy */}
          <motion.div
            className="order-1 md:order-2 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-label">Three-node architecture</span>
            <h2 className="mt-3 text-4xl md:text-[2.5rem] font-bold leading-tight tracking-tight">
              One platform, three perspectives
            </h2>
            <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
              Doctors see a patient's full history before the call starts. Patients
              see which pharmacy has their medicine in stock. Pharmacies verify
              identity with a single tap. Every interaction is logged and encrypted.
            </p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                Provider issues prescription → Patient and pharmacy notified instantly
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                Patient collects medicine → Provider sees fulfilment status
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                Pharmacy stock drops → Automatic resupply to MSD
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
