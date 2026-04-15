import { motion } from 'framer-motion';
import { Download, UserCheck, Stethoscope, Pill } from 'lucide-react';

const steps = [
  {
    icon: Download,
    num: '01',
    title: 'Download the app',
    desc: 'Available on App Store and Play Store. Register with your Bhutanese CID — no paperwork, no queues.',
  },
  {
    icon: UserCheck,
    num: '02',
    title: 'Set up your profile',
    desc: 'Add your medical history, current medications, and your nearest BHU. Takes under three minutes.',
  },
  {
    icon: Stethoscope,
    num: '03',
    title: 'Book or teleconsult',
    desc: 'See available slots at any facility across 20 dzongkhags, or start a video call with a specialist right away.',
  },
  {
    icon: Pill,
    num: '04',
    title: 'Get your medicine',
    desc: 'Your prescription goes straight to the pharmacy. Check stock, pick a location, and collect — no paper needed.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">How it works</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            From download to care in four steps
          </h2>
          <p className="mt-2 text-gray-600 text-base leading-relaxed">
            No training needed. If you can use a phone, you can use AiMedicare.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* connector line between steps */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px border-t border-dashed border-gray-300 translate-x-[28px]" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm relative z-10">
                  <s.icon className="w-6 h-6 text-green-600" strokeWidth={1.7} />
                </div>
                <span className="feat-num mt-3">{s.num}</span>
                <h3 className="font-semibold text-base text-gray-900 mt-1">{s.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed max-w-[220px]">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
