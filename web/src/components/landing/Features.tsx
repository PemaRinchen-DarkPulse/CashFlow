import { motion } from 'framer-motion';

const items = [
  {
    title: 'Digital prescriptions',
    desc: 'No more paper. Doctors issue prescriptions that land on your phone and the pharmacy counter at the same time.',
  },
  {
    title: 'NCD tracking',
    desc: 'Log blood pressure, glucose, and weight at home. Your provider sees trends before you walk in.',
  },
  {
    title: 'Teleconsultation',
    desc: 'Video-call a specialist in Thimphu directly from your BHU — your vitals are already on their screen.',
  },
  {
    title: 'Data stays in Bhutan',
    desc: 'End-to-end encryption. Hosted on MoH-controlled servers inside the country. No exceptions.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-10 md:py-14 bg-gray-50">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        {/* heading row */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">What we built</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            Real tools that solve real problems
          </h2>
          <p className="mt-2 text-gray-600 text-base leading-relaxed">
            We didn't start with a feature list — we started with the people who wait
            hours at JDWNRH, the BHU workers managing emergencies alone, and the
            pharmacies that run out of essential meds.
          </p>
        </motion.div>

        {/* cards */}
        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-lift group border border-gray-200/60 rounded-2xl p-6 md:p-7 bg-white"
            >
              <span className="feat-num">0{i + 1}</span>
              <h3 className="font-semibold text-base text-gray-900 mt-2">{f.title}</h3>
              <p className="mt-1.5 text-[15px] text-gray-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* stats row */}
        <motion.div
          className="flex flex-wrap gap-x-14 gap-y-4 mt-14 pt-10 border-t border-gray-200/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="text-4xl font-bold tracking-tight">3</span>
            <p className="text-sm text-gray-400 mt-0.5">Connected nodes</p>
          </div>
          <div>
            <span className="text-4xl font-bold tracking-tight">20</span>
            <p className="text-sm text-gray-400 mt-0.5">Dzongkhags covered</p>
          </div>
          <div>
            <span className="text-4xl font-bold tracking-tight">0</span>
            <p className="text-sm text-gray-400 mt-0.5">Cost to patients</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
