import { FileText, Activity, Phone, ShieldCheck } from 'lucide-react';

const items = [
  {
    icon: FileText,
    title: 'Digital prescriptions',
    desc: 'No more paper. Doctors issue prescriptions that land on your phone and the pharmacy counter at the same time.',
  },
  {
    icon: Activity,
    title: 'NCD tracking',
    desc: 'Log blood pressure, glucose, and weight at home. Your provider sees trends before you walk in.',
  },
  {
    icon: Phone,
    title: 'Teleconsultation',
    desc: 'Video-call a specialist in Thimphu directly from your BHU — your vitals are already on their screen.',
  },
  {
    icon: ShieldCheck,
    title: 'Data stays in Bhutan',
    desc: 'End-to-end encryption. Hosted on MoH-controlled servers inside the country. No exceptions.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        {/* heading row */}
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">What you get</p>
          <h2 className="text-4xl md:text-[2.75rem] font-extrabold leading-tight tracking-tight">
            Real tools that solve real problems
          </h2>
          <p className="mt-3 text-gray-500 text-base md:text-lg leading-relaxed max-w-lg">
            We didn't start with a feature list — we started with the people who wait
            hours at JDWNRH, the BHU workers managing emergencies alone, and the
            pharmacies that run out of essential meds.
          </p>
        </div>

        {/* cards */}
        <div className="grid sm:grid-cols-2 gap-5 mt-12">
          {items.map((f) => (
            <div
              key={f.title}
              className="card-lift group border border-gray-100 rounded-2xl p-6 md:p-7 bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-green-600" strokeWidth={1.8} />
              </div>
              <h3 className="font-semibold text-base text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-[15px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* stats row */}
        <div className="flex flex-wrap gap-x-14 gap-y-4 mt-14 pt-10 border-t border-gray-100">
          <div>
            <span className="text-4xl font-extrabold tracking-tight">3</span>
            <p className="text-sm text-gray-400 mt-0.5">Connected nodes</p>
          </div>
          <div>
            <span className="text-4xl font-extrabold tracking-tight">20</span>
            <p className="text-sm text-gray-400 mt-0.5">Dzongkhags covered</p>
          </div>
          <div>
            <span className="text-4xl font-extrabold tracking-tight">0</span>
            <p className="text-sm text-gray-400 mt-0.5">Cost to patients</p>
          </div>
        </div>
      </div>
    </section>
  );
}
