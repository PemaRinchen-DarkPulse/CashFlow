import PhoneMockup from './PhoneMockup';

export default function MonitorSection() {
  return (
    <section id="product" className="grain py-20 md:py-28 bg-gray-950 text-white overflow-hidden">
      <div className="relative mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* copy */}
          <div className="max-w-md">
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-green-400 mb-5">
              Stay in the loop
            </span>
            <h2 className="text-4xl md:text-[2.5rem] font-extrabold leading-tight tracking-tight">
              Your health story, always&nbsp;with&nbsp;you
            </h2>
            <p className="mt-4 text-gray-400 text-base md:text-lg leading-relaxed">
              Every consultation, prescription, and lab result lives in one place.
              Switch providers, move dzongkhags, get referred to JDWNRH — nothing
              gets lost along the way.
            </p>
            <a href="#" className="inline-block mt-7 text-base font-medium bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors">
              See how it works
            </a>
          </div>

          {/* phone */}
          <div className="flex justify-center md:justify-end">
            <PhoneMockup>
              <div className="p-4 pt-10 bg-white h-full text-gray-900">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Prescriptions</p>

                {/* active rx */}
                <div className="mt-3 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-3.5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] opacity-70">Active</span>
                    <span className="text-[8px] bg-white/15 px-2 py-0.5 rounded">Refill in 12 d</span>
                  </div>
                  <p className="font-semibold text-sm mt-1.5">Amlodipine 5 mg</p>
                  <p className="text-[9px] opacity-70 mt-0.5">1 tablet · every morning</p>
                  <div className="mt-2.5 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                {/* history */}
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-5 mb-2">History</p>
                {[
                  { emoji: '🔬', label: 'Blood work results', date: 'Mar 15' },
                  { emoji: '🩺', label: 'Consult with Dr. Dorji', date: 'Mar 10' },
                  { emoji: '💉', label: 'Hepatitis B booster', date: 'Feb 28' },
                  { emoji: '📈', label: 'BP trend (3 months)', date: 'Feb 20' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm shrink-0">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-800 truncate">{r.label}</p>
                      <p className="text-[9px] text-gray-400">{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}
