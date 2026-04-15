const sections = [
  {
    title: 'About',
    links: ['About Us', 'Products', 'Blog', 'Download'],
  },
  {
    title: 'Company',
    links: ['How we work', 'Press', 'Careers', 'Community'],
  },
  {
    title: 'Legal',
    links: ['Terms of Use', 'Privacy Policy', 'Security', 'Cookie Settings'],
  },
];

export default function Footer() {
  return (
    <footer id="about" className="bg-gray-950 text-white pt-14 pb-8">
      <div className="mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="inline-flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="14" fill="#16a34a" />
                <path d="M14 8v12M8 14h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="font-semibold text-base">AiMedicare</span>
            </a>
            <p className="mt-4 text-[15px] text-gray-500 leading-relaxed max-w-xs">
              A healthcare equity project with technology as its delivery mechanism.
              Built for Bhutan's mountains, languages, and values.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
              ].map((d, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-md bg-gray-800/60 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  aria-label="Social"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>
                </a>
              ))}
            </div>
          </div>

          {sections.map(s => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">{s.title}</h4>
              <ul className="space-y-2.5">
                {s.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-[15px] text-gray-500 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800/60 mt-12 pt-6 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} AiMedicare &middot; Ministry of Health, Royal Government of Bhutan
          </p>
        </div>
      </div>
    </footer>
  );
}
