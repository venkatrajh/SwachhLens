import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Sparkles, ImageOff } from 'lucide-react';

interface VerificationCardProps {
  beforeImage?: string;
  afterImage?: string;
  verifiedAt?: string;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  beforeImage,
  afterImage,
  verifiedAt,
}) => {
  const { t } = useTranslation();

  const formattedDate = (() => {
    if (!verifiedAt) return null;
    try {
      const d = new Date(verifiedAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  })();

  return (
    <div className="bg-gradient-to-br from-[#EAF6EF] to-white dark:from-[#1A2C23] dark:to-[#14221B] rounded-2xl p-4 border border-[#168A5B]/30 dark:border-[#39B77A]/30 shadow-card space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#168A5B]/20 dark:border-[#39B77A]/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center shadow-xs">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-[#0F5132] dark:text-[#39B77A]">
              {t('reportDetails.cleanupCompleted')}
            </h2>
            {formattedDate && (
              <span className="text-[10px] text-[#64736A] dark:text-[#A9BBB1]">{formattedDate}</span>
            )}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] text-[10px] font-bold tracking-wider">
          100% RESOLVED
        </span>
      </div>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Before */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block">
            {t('reportDetails.before')}
          </span>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-[#DCE7E1] dark:border-[#294037] flex items-center justify-center">
            {beforeImage ? (
              <img
                src={beforeImage}
                alt="Before Cleanup"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center text-[#64736A] dark:text-[#A9BBB1]">
                <ImageOff className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-[9px] font-medium leading-tight">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* After */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#168A5B] dark:text-[#39B77A] uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{t('reportDetails.after')}</span>
          </span>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-emerald-50 dark:bg-[#1A2C23] border-2 border-[#168A5B]/40 dark:border-[#39B77A]/40 shadow-xs flex items-center justify-center">
            {afterImage ? (
              <img
                src={afterImage}
                alt="After Cleanup"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center text-[#168A5B] dark:text-[#39B77A]">
                <ImageOff className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-[9px] font-medium leading-tight">Evidence pending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-white/90 dark:bg-[#14221B]/90 rounded-xl border border-[#168A5B]/20 dark:border-[#39B77A]/20 text-center">
        <span className="text-xs font-bold text-[#0F5132] dark:text-[#39B77A] block">
          {t('reportDetails.cleanupVerified')}
        </span>
        <p className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] mt-0.5">
          {t('reportDetails.cleanupVerifiedDesc')}
        </p>
      </div>
    </div>
  );
};
