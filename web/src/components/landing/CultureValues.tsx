import { motion } from 'framer-motion';
import { Heart, Scale, Mountain, Users, Leaf, Eye } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Patient first, always',
    desc: 'Every decision we make starts with one question: does this make care better for the person at the other end?',
  },
  {
    icon: Scale,
    title: 'Health equity',
    desc: 'A farmer in Lhuntse deserves the same quality of care as someone living five minutes from JDWNRH.',
  },
  {
    icon: Mountain,
    title: 'Rooted in GNH',
    desc: 'We measure success not just in uptime and throughput, but in wellbeing — the way Bhutan always has.',
  },
  {
    icon: Users,
    title: 'Community-driven',
    desc: 'Built with BHU workers, doctors, and patients — not for them. Every feature started as a real conversation.',
  },
  {
    icon: Leaf,
    title: 'Respect for tradition',
    desc: 'Sowa Rigpa and modern medicine work side by side. We don\'t replace what works — we connect it.',
  },
  {
    icon: Eye,
    title: 'Radical transparency',
    desc: 'Open audit logs, clear data policies, and no hidden decisions. Trust is earned, not assumed.',
  },
];

export default function CultureValues() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">Who we are</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            Culture &amp; core values
          </h2>
          <p className="mt-2 text-gray-600 text-base leading-relaxed">
            The principles behind every line of code, every design choice,
            and every partnership we build.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              className="card-lift border border-gray-200/60 rounded-2xl p-6 bg-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <v.icon className="w-6 h-6 text-green-600 mb-3" strokeWidth={1.7} />
              <h3 className="font-semibold text-base text-gray-900">{v.title}</h3>
              <p className="mt-1.5 text-[15px] text-gray-600 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
