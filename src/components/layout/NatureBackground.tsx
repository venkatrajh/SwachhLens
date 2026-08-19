import React from 'react';

export const NatureBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-60"
      aria-hidden="true"
    >
      {/* Soft organic glow circles */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#168A5B]/5 blur-3xl animate-pulse-subtle" />
      <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-[#22A06B]/5 blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 h-72 rounded-full bg-[#EAF6EF]/70 blur-2xl" />

      {/* Subtle floating leaves */}
      <div className="absolute top-12 left-6 text-[#168A5B]/15 animate-float-slow transform -rotate-12">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
      </div>

      <div className="absolute top-1/2 right-4 text-[#22A06B]/15 animate-float-slow transform rotate-45 [animation-delay:2s]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
      </div>

      <div className="absolute bottom-36 left-8 text-[#0F5132]/10 animate-float-slow transform -rotate-45 [animation-delay:4s]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z" />
        </svg>
      </div>
    </div>
  );
};
