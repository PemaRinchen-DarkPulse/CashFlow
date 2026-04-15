import { motion } from 'framer-motion';

const people = [
  {
    name: 'Dr. Tshering Dorji',
    role: 'Physician, Mongar District Hospital',
    quote: "I used to spend the first five minutes of a referral trying to figure out what the BHU had already done. Now I open the patient's record and it's all there — meds, vitals, notes. That five minutes matters when someone's been travelling for hours to see you.",
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=tshering-doc',
  },
  {
    name: 'Karma Wangmo',
    role: 'Mother of three, Haa',
    quote: "My youngest needed a vaccine and I kept forgetting the date. The app reminded me three days early, showed me the BHU schedule, and I booked a slot. We were in and out in twenty minutes.",
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=karma-w',
  },
  {
    name: 'Phub Dorji',
    role: 'Health Assistant, Lhuntse BHU',
    quote: "Last monsoon a patient came in with symptoms I hadn't seen before. I ran the triage tool, got a referral recommendation, and video-called a specialist in Thimphu within ten minutes. The patient's history was already shared. That's the difference.",
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=phub',
  },
];

export default function Testimonials() {
  return (
    <section id="stories" className="py-20 md:py-28">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">From the field</span>
          <h2 className="mt-3 text-4xl md:text-[2.5rem] font-bold leading-tight tracking-tight">
            In their own words
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {people.map((p, i) => (
            <motion.div
              key={p.name}
              className="card-lift rounded-2xl p-6 flex flex-col bg-white border border-gray-200/60"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <p className="text-[15px] leading-relaxed flex-1 text-gray-600">
                "{p.quote}"
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <img
                  src={p.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full shrink-0 bg-gray-100"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs truncate text-gray-400">{p.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
