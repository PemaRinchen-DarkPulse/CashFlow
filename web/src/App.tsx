
import './App.css'
import Navbar from './components/landing/Navbar'
import Hero from './components/landing/Hero'
import Features from './components/landing/Features'
import CultureValues from './components/landing/CultureValues'
import HowItWorks from './components/landing/HowItWorks'
import MonitorSection from './components/landing/MonitorSection'
import FeatureCards from './components/landing/FeatureCards'
import ConnectionSection from './components/landing/ConnectionSection'
import Testimonials from './components/landing/Testimonials'
import CTABanner from './components/landing/CTABanner'
import Footer from './components/landing/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <CultureValues />
      <HowItWorks />
      <MonitorSection />
      <FeatureCards />
      <ConnectionSection />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  )
}

export default App
