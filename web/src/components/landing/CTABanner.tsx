import { motion } from 'framer-motion';

export default function CTABanner() {
  return (
    <section className="py-6 bg-gray-50">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="bg-gray-950 rounded-2xl px-6 py-14 md:py-20 text-center relative overflow-hidden">

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white max-w-lg mx-auto leading-snug tracking-tight">
            Good healthcare shouldn't depend on your postcode
          </h2>
          <p className="text-gray-400 mt-3 max-w-sm mx-auto text-base leading-relaxed">
            Download AiMedicare and get the same connected care whether you're in
            Thimphu or Trashi Yangtse.
          </p>
          <a
            href="#"
            className="inline-block mt-7 bg-green-600 text-white text-base font-semibold px-7 py-3 rounded-lg hover:bg-green-500 transition-colors"
          >
            Download App
          </a>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
