import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'

/* ================================================================
   INLINE SVG ICONS (Monochrome, consistent stroke style)
   ================================================================ */

const Icons = {
  brain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-3 3 3 3 0 0 0 1 2.24V16a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-3.76A3 3 0 0 0 19 10a3 3 0 0 0-3-3V6a4 4 0 0 0-4-4z"/>
      <path d="M12 2v20"/>
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="14" height="14" rx="2"/>
      <path d="m16 10 6-3v10l-6-3"/>
    </svg>
  ),
  fileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
  pill: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 1.5 3 3-8 8-3-3a4.24 4.24 0 0 1 0-6 4.24 4.24 0 0 1 6 0z"/>
      <path d="m13.5 10.5 3 3a4.24 4.24 0 0 1 0 6 4.24 4.24 0 0 1-6 0l-3-3"/>
      <path d="m7 13 5-5"/>
    </svg>
  ),
  alertTriangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-5 7-11 8-11s8 6 8 11a7 7 0 0 1-7 7z"/>
      <path d="M12 20V8"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>
    </svg>
  ),
  baby: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 0 0-16 0"/>
      <path d="M10 7h.01M14 7h.01"/>
      <path d="M10 10c.5.5 1.5 1 2 1s1.5-.5 2-1"/>
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  wifiOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1l22 22"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1"/>
    </svg>
  ),
  hospital: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
      <path d="M9 9h6M12 6v6"/>
    </svg>
  ),
  userCheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  languages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 8 6 6"/>
      <path d="m4 14 6-6 2-3"/>
      <path d="M2 5h12"/>
      <path d="M7 2h1"/>
      <path d="m22 22-5-10-5 10"/>
      <path d="M14 18h6"/>
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
}

/* ================================================================
   DATA
   ================================================================ */

const FEATURES = [
  { icon: Icons.brain, title: 'AI Health Analysis', desc: 'Real-time vitals monitoring with intelligent AI that tracks your health score, flags abnormalities, and delivers actionable insights.' },
  { icon: Icons.video, title: 'Teleconsultation', desc: 'Connect with doctors through video or voice calls. Your patient history is pre-shared so specialists get full context instantly.' },
  { icon: Icons.fileText, title: 'Digital Prescriptions', desc: 'Receive prescriptions instantly in Dzongkha or English. Find the nearest pharmacy with stock before you travel.' },
  { icon: Icons.pill, title: 'Smart Pharmacy', desc: 'Live drug inventory across all facilities. AI-powered drug interaction alerts and automated resupply keep medications accessible.' },
  { icon: Icons.alertTriangle, title: 'Emergency SOS', desc: 'One-tap emergency alert transmits your GPS location and full health record to the nearest facility.' },
  { icon: Icons.leaf, title: 'Sowa Rigpa', desc: 'Traditional medicine fully integrated with drug-herb interaction alerts and complementary care pathways.' },
  { icon: Icons.clipboard, title: 'Health Records', desc: 'Full longitudinal health record — diagnoses, prescriptions, lab results, vaccinations — accessible anytime.' },
  { icon: Icons.baby, title: 'Maternal & Child', desc: 'Pregnancy monitoring, immunisation tracking, and nutrition monitoring with AI risk-flagging for complications.' },
  { icon: Icons.activity, title: 'NCD Monitoring', desc: 'Log blood pressure, glucose, and weight at home. AI flags dangerous trends directly to your healthcare provider.' },
]

const WHY_ITEMS = [
  { icon: Icons.globe, title: 'Built for Bhutan', desc: 'Designed for Bhutan\'s mountains, languages, and GNH values — not a transplant from Western health apps.' },
  { icon: Icons.lock, title: 'Data Sovereignty', desc: 'All data hosted on Bhutan-based servers under MoH control. End-to-end encryption. Zero foreign data transit.' },
  { icon: Icons.wifiOff, title: 'Offline-First', desc: 'Functional on low-bandwidth and offline networks with automatic sync on reconnection.' },
  { icon: Icons.hospital, title: 'Free Healthcare', desc: 'Guarantees zero cost within public healthcare — no hidden charges through the digital layer.' },
  { icon: Icons.userCheck, title: 'Human-in-the-Loop AI', desc: 'No AI recommendation is acted upon without human review. AI advises; qualified health workers decide.' },
  { icon: Icons.languages, title: 'Fully Bilingual', desc: 'Full Dzongkha interface as primary language with English for professionals. Voice-based interaction available.' },
]

const HOW_STEPS = [
  { num: '1', title: 'Open AiMediCare', desc: 'AI symptom checker guides you to the right level of care.' },
  { num: '2', title: 'Book & Consult', desc: 'Book appointments or request teleconsultation with full history ready.' },
  { num: '3', title: 'Get Treated', desc: 'Digital prescription sent instantly to your app and nearest pharmacy.' },
  { num: '4', title: 'Stay Well', desc: 'Medication reminders, follow-ups, and continuous health monitoring.' },
]

const TESTIMONIALS = [
  {
    text: 'AiMediCare has transformed how I manage my patients in Lhuntse. I can now consult with specialists in Thimphu through video calls, and the AI pre-summary saves us both time.',
    name: 'Dr. Karma Wangdi',
    role: 'Health Assistant, BHU Lhuntse',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80',
  },
  {
    text: 'My mother takes four different medicines. The medication reminders and refill alerts mean she never misses a dose. The Dzongkha interface makes it easy for her.',
    name: 'Tshering Dema',
    role: 'Patient, Thimphu',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
  {
    text: 'The digital prescription system eliminated paper delays by 90%. Drug interaction alerts have prevented two potentially dangerous combinations this month alone.',
    name: 'Phuntsho Dorji',
    role: 'Pharmacist, JDWNRH',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
]

const FAQS = [
  { q: 'Is AiMediCare free to use?', a: 'Yes. AiMediCare is completely free for all Bhutanese citizens within the public healthcare system. No hidden charges are introduced through the digital layer.' },
  { q: 'Does it work in areas with poor internet?', a: 'Absolutely. AiMediCare is built offline-first. It works on low-bandwidth and offline networks, syncing automatically when connectivity is restored. SMS and USSD are also supported.' },
  { q: 'Is my health data secure?', a: 'All data is hosted on Bhutan-based servers under Ministry of Health control with end-to-end encryption. No health data transits through foreign data centers.' },
  { q: 'Can I use AiMediCare in Dzongkha?', a: 'Yes — Dzongkha is the primary interface language. English is available for professionals. Voice-based interaction is also available for low-literacy users.' },
  { q: 'How does the AI work?', a: 'AI assists with symptom assessment, clinical decision support, and drug interaction detection. No AI recommendation is acted upon without review by a qualified health worker.' },
  { q: 'Does it support traditional medicine?', a: 'Yes. Sowa Rigpa is fully integrated. Traditional medicine practitioners can issue digital prescriptions, and the system flags drug-herb interactions.' },
]

const PARTNERS = ['Ministry of Health', 'JDWNRH', 'GNH Commission', 'Medical Supplies Depot', 'National Traditional Medicine Hospital']

/* ================================================================
   HOOKS
   ================================================================ */

function useScrollReveal() {
  const ref = useRef<IntersectionObserver | null>(null)
  useEffect(() => {
    ref.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); ref.current?.unobserve(e.target) }
      }),
      { threshold: 0.12, rootMargin: '-40px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => ref.current?.observe(el))
    return () => ref.current?.disconnect()
  }, [])
}

function useNavScroll() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return scrolled
}

/* ================================================================
   COMPONENTS
   ================================================================ */

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="section-label">
      <span className="section-label-dot" />
      <span className="section-label-text">{text}</span>
    </div>
  )
}

/* ── Navbar ── */
function Navbar() {
  const scrolled = useNavScroll()
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <a href="#" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="nav-logo-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
            <span className="nav-logo-text">AiMediCare</span>
          </a>

          <div className="nav-links">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>Features</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}>How It Works</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo('testimonials') }}>Testimonials</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq') }}>FAQ</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact') }}>Contact</a>
          </div>

          <div className="nav-actions">
            <button className="nav-cta" onClick={() => window.location.href = '/login'}>Log In</button>
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <div className="hamburger-lines">
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>Features</a>
        <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}>How It Works</a>
        <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollTo('testimonials') }}>Testimonials</a>
        <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq') }}>FAQ</a>
        <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact') }}>Contact</a>
        <button className="btn-primary" onClick={() => scrollTo('download')}>Download App</button>
      </div>
    </>
  )
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-pill">NEW</span>
            <span className="hero-badge-text">
              Bhutan's digital health ecosystem
              <span className="hero-badge-arrow">›</span>
            </span>
          </div>

          <h1 className="hero-headline">
            Healthcare that <span className="highlight">reaches</span> every valley
          </h1>

          <p className="hero-description">
            AiMediCare connects patients, providers, and pharmacies through a single AI-powered platform — bringing quality care to every Bhutanese citizen.
          </p>

          <div className="hero-download-btns">
            <a href="#download" className="hero-dl-btn hero-dl-apple">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div>
                <span className="hero-dl-label">Download on the</span>
                <span className="hero-dl-store">App Store</span>
              </div>
            </a>
            <a href="#download" className="hero-dl-btn hero-dl-google">
              <svg viewBox="0 0 512 512" fill="none" width="20" height="20">
                <path d="M48 59.49v393a17 17 0 0 0 27.64 13.3L284 256 75.64 46.19A17 17 0 0 0 48 59.49z" fill="#2196F3"/>
                <path d="M75.64 46.19L284 256l75.64-75.64L137.7 16.81a17.07 17.07 0 0 0-62.06 29.38z" fill="#4CAF50"/>
                <path d="M359.64 180.36L284 256l75.64 75.64 98.05-56.59a19.63 19.63 0 0 0 0-34.1z" fill="#FFC107"/>
                <path d="M284 256L75.64 465.81A17.07 17.07 0 0 0 137.7 495.19l221.94-128.23z" fill="#F44336"/>
              </svg>
              <div>
                <span className="hero-dl-label">Get it on</span>
                <span className="hero-dl-store">Google Play</span>
              </div>
            </a>
          </div>

          {/* Social proof */}
          <div className="hero-social-proof">
            <div className="hero-avatars">
              <img className="hero-avatar" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" alt="user" />
              <img className="hero-avatar" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80" alt="user" />
              <img className="hero-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" alt="user" />
              <img className="hero-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="user" />
            </div>
            <div>
              <div className="hero-stars">
                {[...Array(5)].map((_, i) => (
                  <span className="hero-star" key={i}>
                    <svg viewBox="0 0 24 24" fill="#FF8F20" stroke="none">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                  </span>
                ))}
              </div>
              <p className="hero-users-text">Trusted by 700K+ citizens</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Partners & Stats ── */
function PartnersStats() {
  return (
    <section className="partners-section">
      <div className="container">
        <div className="partners-logos reveal">
          {PARTNERS.map((p) => (
            <span className="partner-logo" key={p}>{p}</span>
          ))}
        </div>

        <div className="stats-grid">
          {[
            { value: '20', label: 'Dzongkhags Covered' },
            { value: '700K+', label: 'Citizens Served' },
            { value: '40%', label: 'Rural Teleconsultation Rate' },
            { value: '90%', label: 'Referral Tracking' },
          ].map((s, i) => (
            <div className={`stat-item reveal reveal-delay-${i + 1}`} key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features ── */
function Features() {
  return (
    <section className="features-section section-padding" id="features">
      <div className="container">
        <div className="section-header reveal">
          <SectionLabel text="Features" />
          <h2 className="section-headline">
            Everything You Need, <span className="gradient-text">In One App</span>
          </h2>
          <p className="section-subtitle">
            A complete digital health ecosystem connecting patients, providers, and pharmacies through AI-powered intelligence.
          </p>
        </div>

        <div className="features-grid reveal reveal-delay-2">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-card-icon">{f.icon}</div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Why Choose Us ── */
function WhyChoose() {
  return (
    <section className="why-section section-padding" id="why">
      <div className="container">
        <div className="section-header reveal">
          <SectionLabel text="Why AiMediCare" />
          <h2 className="section-headline">
            Built Different, <span className="gradient-text">Built for Bhutan</span>
          </h2>
          <p className="section-subtitle">
            Designed from the ground up for Bhutan's unique geography, culture, and values.
          </p>
        </div>

        <div className="why-grid">
          {WHY_ITEMS.map((item, i) => (
            <div className={`why-card reveal reveal-delay-${Math.min(i + 1, 4)}`} key={item.title}>
              <div className="why-card-icon">{item.icon}</div>
              <h3 className="why-card-title">{item.title}</h3>
              <p className="why-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How It Works ── */
function HowItWorks() {
  return (
    <section className="how-section section-padding" id="how-it-works">
      <div className="container">
        <div className="section-header reveal">
          <SectionLabel text="How It Works" />
          <h2 className="section-headline">
            Your Health Journey, <span className="gradient-text">Simplified</span>
          </h2>
          <p className="section-subtitle">
            From feeling unwell to feeling well — four simple steps with intelligent care coordination.
          </p>
        </div>

        <div className="how-timeline">
          {HOW_STEPS.map((step, i) => (
            <div className={`how-step reveal reveal-delay-${i + 1}`} key={step.num}>
              <div className="how-step-number">{step.num}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ── */
function Testimonials() {
  return (
    <section className="testimonials-section section-padding" id="testimonials">
      <div className="container">
        <div className="section-header reveal">
          <SectionLabel text="Testimonials" />
          <h2 className="section-headline">
            Trusted by <span className="gradient-text">Healthcare Heroes</span>
          </h2>
          <p className="section-subtitle">
            Hear how AiMediCare is transforming healthcare delivery across Bhutan.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className={`testimonial-card reveal reveal-delay-${i + 1}`} key={t.name}>
              <span className="testimonial-quote-mark">"</span>
              <div className="testimonial-accent-bar" />
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <img className="testimonial-avatar" src={t.avatar} alt={t.name} loading="lazy" />
                <div>
                  <div className="testimonial-author-name">{t.name}</div>
                  <div className="testimonial-author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Download App ── */
function DownloadApp() {
  return (
    <section className="download-section section-padding" id="download">
      <div className="container">
        <div className="download-content reveal">
          <SectionLabel text="Download App" />
          <h2>
            Take Your <span className="gradient-text">Health</span> Everywhere
          </h2>
          <p>
            Download AiMediCare and join hundreds of thousands of Bhutanese citizens accessing quality healthcare from the palm of their hand.
          </p>

          <div className="download-badges">
            <a href="#" className="store-badge">
              <span className="store-badge-icon">▶</span>
              <div>
                <div className="store-badge-text-small">Get it on</div>
                <div className="store-badge-text-large">Google Play</div>
              </div>
            </a>
            <a href="#" className="store-badge">
              <span className="store-badge-icon">◉</span>
              <div>
                <div className="store-badge-text-small">Download on the</div>
                <div className="store-badge-text-large">App Store</div>
              </div>
            </a>
          </div>
        </div>

        <div className="download-visual reveal reveal-delay-2">
          <div className="download-phone-glow" />
          <img
            className="download-phone-img"
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=640&q=80"
            alt="AiMediCare app on smartphone"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ── */
function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="faq-section section-padding" id="faq">
      <div className="container">
        <div className="section-header reveal">
          <SectionLabel text="FAQ" />
          <h2 className="section-headline">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to know about AiMediCare.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div className={`faq-item reveal reveal-delay-${Math.min(i + 1, 4)}${openIdx === i ? ' open' : ''}`} key={i}>
              <button className="faq-question" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                {faq.q}
                <span className="faq-toggle">+</span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Contact ── */
function Contact() {
  return (
    <section className="contact-section section-padding" id="contact">
      <div className="container">
        <div className="section-header reveal">
          <SectionLabel text="Contact" />
          <h2 className="section-headline">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="section-subtitle">
            Have questions, feedback, or want to partner with AiMediCare?
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info reveal">
            <h3>Let's Connect</h3>
            <p>Reach out and we'll get back to you within 24 hours.</p>

            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-item-icon">{Icons.mail}</div>
                <div>
                  <div className="contact-item-label">Email</div>
                  <div className="contact-item-value">hello@aimedicare.bt</div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon">{Icons.phone}</div>
                <div>
                  <div className="contact-item-label">Phone</div>
                  <div className="contact-item-value">+975 2 335 678</div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-item-icon">{Icons.mapPin}</div>
                <div>
                  <div className="contact-item-label">Address</div>
                  <div className="contact-item-value">Norzin Lam, Thimphu, Bhutan</div>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form reveal reveal-delay-2" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="c-name">Full Name</label>
              <input className="form-input" type="text" id="c-name" placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-email">Email</label>
              <input className="form-input" type="email" id="c-email" placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-subject">Subject</label>
              <input className="form-input" type="text" id="c-subject" placeholder="How can we help?" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="c-message">Message</label>
              <textarea className="form-textarea" id="c-message" placeholder="Tell us more..." />
            </div>
            <button className="form-submit" type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <div className="nav-logo-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </div>
              <span className="nav-logo-text">AiMediCare</span>
            </a>
            <p className="footer-brand-desc">
              Bhutan's first fully integrated digital health ecosystem — extending free public healthcare into every valley.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link" aria-label="Facebook">f</a>
              <a href="#" className="footer-social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn">in</a>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Product</h4>
            <div className="footer-column-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#download">Download</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Company</h4>
            <div className="footer-column-links">
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
              <a href="#contact">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Legal</h4>
            <div className="footer-column-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Data Security</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">© {new Date().getFullYear()} AiMediCare. All rights reserved.</span>
          <div className="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ================================================================
   APP
   ================================================================ */

export default function App() {
  useScrollReveal()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PartnersStats />
        <Features />
        <WhyChoose />
        <HowItWorks />
        <Testimonials />
        <DownloadApp />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
