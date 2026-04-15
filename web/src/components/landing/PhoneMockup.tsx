import type { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export default function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-[240px] h-[490px] bg-[#1c1c1e] rounded-[38px] p-[8px] shadow-xl ring-1 ring-gray-800/40">
        {/* notch */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1c1c1e] rounded-full z-10" />
        <div className="w-full h-full rounded-[31px] overflow-hidden bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
