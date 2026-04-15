import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Product', href: '#product' },
  { label: 'Blog', href: '#stories' },
  { label: 'About Us', href: '#about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto px-6 md:px-12 lg:px-20 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="14" fill="#16a34a" />
            <path d="M14 8v12M8 14h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="font-semibold text-lg tracking-tight">AiMedicare</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-base text-gray-600 hover:text-gray-900 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#demo"
          className="hidden md:inline-flex text-base font-medium bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Get a Demo
        </a>

        <button className="md:hidden text-gray-500 cursor-pointer" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 pb-5 pt-3 space-y-1">
          {links.map(l => (
            <a key={l.href} href={l.href} className="block py-2 text-sm text-gray-600" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#demo" className="block mt-3 text-center text-sm font-medium bg-gray-900 text-white px-5 py-2.5 rounded-lg">
            Get a Demo
          </a>
        </div>
      )}
    </nav>
  );
}
