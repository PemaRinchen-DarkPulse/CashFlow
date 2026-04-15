import { motion } from 'framer-motion';
import PhoneMockup from './PhoneMockup';

export default function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="mx-auto px-6 md:px-12 lg:px-20 pt-14 pb-24 md:pt-24 md:pb-36">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* copy */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-[2.75rem] md:text-6xl font-bold leading-[1.1] tracking-tight">
              Better healthcare for every{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Bhutanese</span>
                <span aria-hidden className="absolute bottom-1 left-0 right-0 h-3 bg-green-200/60 -z-0 rounded-sm" />
              </span>{' '}
              citizen
            </h1>

            <p className="mt-5 text-gray-600 text-base md:text-lg leading-[1.7] max-w-md">
              One app that links doctors, patients, and pharmacies across all 20
              dzongkhags — so a farmer in Lhuntse gets the same quality of care
              as someone in Thimphu.
            </p>

            <div className="flex items-center gap-3 mt-7">
              <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 text-sm font-medium px-3 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Backed by Ministry of Health
              </span>
            </div>

            <div className="mt-9">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">
                Download the app
              </p>
              <div className="flex flex-wrap gap-2.5">
                {/* App Store */}
                <a href="#" className="inline-flex items-center gap-2 bg-gray-900 text-white pl-3.5 pr-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-left leading-tight">
                    <span className="block text-[9px] opacity-70">Download on the</span>
                    <span className="block text-xs font-semibold">App Store</span>
                  </div>
                </a>
                {/* Play Store */}
                <a href="#" className="inline-flex items-center gap-2 bg-gray-900 text-white pl-3.5 pr-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                  <div className="text-left leading-tight">
                    <span className="block text-[9px] opacity-70">Get it on</span>
                    <span className="block text-xs font-semibold">Play Store</span>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>

          {/* phones */}
          <motion.div
            className="relative flex justify-center items-center min-h-[520px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* floating badge */}
            <div className="absolute -top-1 right-2 md:right-6 bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-3.5 py-2.5 flex items-center gap-2.5 z-20">
              <div className="flex -space-x-1.5">
                <img src="https://api.dicebear.com/9.x/notionists/svg?seed=tshering" alt="" className="w-7 h-7 rounded-full border-2 border-white bg-gray-100" />
                <img src="https://api.dicebear.com/9.x/notionists/svg?seed=karma" alt="" className="w-7 h-7 rounded-full border-2 border-white bg-gray-100" />
                <img src="https://api.dicebear.com/9.x/notionists/svg?seed=dorji" alt="" className="w-7 h-7 rounded-full border-2 border-white bg-gray-100" />
              </div>
              <div className="leading-tight">
                <span className="block text-sm font-bold">20+</span>
                <span className="block text-[10px] text-gray-400">Dzongkhags</span>
              </div>
            </div>

            {/* back phone (vitals) */}
            <div className="absolute -left-2 md:left-6 top-10">
              <PhoneMockup className="opacity-[0.88] scale-[0.82]">
                <div className="p-4 pt-10 bg-white h-full">
                  <p className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">Vitals</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'Blood Pressure', val: '120/80', unit: 'mmHg', bg: 'bg-green-50' },
                      { label: 'Heart Rate', val: '72', unit: 'bpm', bg: 'bg-gray-50' },
                      { label: 'Glucose', val: '95', unit: 'mg/dL', bg: 'bg-gray-50' },
                      { label: 'SpO₂', val: '98%', unit: '', bg: 'bg-blue-50' },
                    ].map(v => (
                      <div key={v.label} className={`${v.bg} rounded-xl px-3.5 py-3 flex items-center justify-between`}>
                        <div>
                          <p className="text-[9px] text-gray-400">{v.label}</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">{v.val} <span className="text-[9px] font-normal text-gray-400">{v.unit}</span></p>
                        </div>
                        <span className="text-green-500 text-xs">&#10003;</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PhoneMockup>
            </div>

            {/* front phone (home) */}
            <div className="relative z-10 ml-24 md:ml-32">
              <PhoneMockup>
                <div className="p-4 pt-10 bg-white h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-400">Good morning,</p>
                      <p className="text-sm font-semibold">Tshering Pem</p>
                    </div>
                    <img src="https://api.dicebear.com/9.x/notionists/svg?seed=tshering" alt="" className="w-8 h-8 rounded-full bg-green-100" />
                  </div>

                  {/* score */}
                  <div className="mt-3.5 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-4 text-white">
                    <p className="text-[9px] opacity-70">Your health score</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[28px] font-extrabold leading-none">92</span>
                      <span className="text-[10px] opacity-60">/ 100</span>
                    </div>
                    <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* actions */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    <div className="bg-green-50 rounded-lg px-2.5 py-2 text-center">
                      <span className="text-sm">📅</span>
                      <p className="text-[8px] text-gray-500 mt-0.5">Appointments</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg px-2.5 py-2 text-center">
                      <span className="text-sm">💊</span>
                      <p className="text-[8px] text-gray-500 mt-0.5">Prescriptions</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg px-2.5 py-2 text-center">
                      <span className="text-sm">📋</span>
                      <p className="text-[8px] text-gray-500 mt-0.5">Records</p>
                    </div>
                    <div className="bg-red-50 rounded-lg px-2.5 py-2 text-center">
                      <span className="text-sm">🆘</span>
                      <p className="text-[8px] text-gray-500 mt-0.5">SOS</p>
                    </div>
                  </div>

                  {/* upcoming */}
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <p className="text-[8px] text-gray-400 uppercase tracking-wide">Upcoming</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <img src="https://api.dicebear.com/9.x/notionists/svg?seed=dorji-doc" alt="" className="w-7 h-7 rounded-full bg-green-100" />
                      <div>
                        <p className="text-[10px] font-medium text-gray-900">Dr. Dorji Wangchuk</p>
                        <p className="text-[9px] text-gray-400">Tomorrow at 10 AM &middot; JDWNRH</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
