import React from 'react';
import type { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = '',
  hasBottomNav = true,
}) => {
  return (
    <div className="min-h-screen bg-[#F0F4F2] dark:bg-[#080E0B] flex justify-center items-stretch antialiased selection:bg-[#EAF6EF] dark:selection:bg-[#1A2C23]">
      <main
        className={`w-full max-w-[440px] min-h-[100dvh] bg-[#F7FAF8] dark:bg-[#0D1712] shadow-2xl relative flex flex-col justify-between overflow-x-hidden border-x border-[#DCE7E1]/50 dark:border-[#294037]/50 ${
          hasBottomNav ? 'pb-24' : 'pb-6'
        } ${className}`}
      >
        <div className="flex-1 flex flex-col relative z-10">{children}</div>
      </main>
    </div>
  );
};
