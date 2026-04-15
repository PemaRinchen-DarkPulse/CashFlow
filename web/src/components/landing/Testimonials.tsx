import { Star } from 'lucide-react';

const people = [
  {
    name: 'Dr. Tshering Dorji',
    role: 'Physician, Mongar District Hospital',
    stars: 5,
    quote: "I used to spend the first five minutes of a referral trying to figure out what the BHU had already done. Now I open the patient's record and it's all there — meds, vitals, notes. That five minutes matters when someone's been travelling for hours to see you.",
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=tshering-doc',
  },
  {
    name: 'Karma Wangmo',
    role: 'Mother of three, Haa',
    stars: 5,
    quote: "My youngest needed a vaccine and I kept forgetting the date. The app reminded me three days early, showed me the BHU schedule, and I booked a slot. We were in and out in twenty minutes. Before this I would have waited half the morning.",
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=karma-w',
  },
  {
    name: 'Phub Dorji',
    role: 'Health Assistant, Lhuntse BHU',
    stars: 5,
    quote: "Last monsoon a patient came in with symptoms I hadn't seen before. I ran the triage tool, got a referral recommendation, and video-called a specialist in Thimphu within ten minutes. The patient's history was already shared. That's the difference.",
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=phub',
  },
];

export default function Testimonials() {
  return (
    <section id="stories" className="py-20 md:py-28">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-lg mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">From the field</p>
          <h2 className="text-4xl md:text-[2.5rem] font-extrabold leading-tight tracking-tight">
            People who've used it, in their own words
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {people.map((p) => (
            <div
              key={p.name}
              className="card-lift bg-white border border-gray-100 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full bg-gray-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold truncate">{p.name}</p>
                  <p className="text-sm text-gray-400 truncate">{p.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mt-3">
                {Array.from({ length: p.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-[15px] text-gray-500 leading-relaxed flex-1">
                "{p.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
