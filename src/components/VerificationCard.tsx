import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Sparkles } from 'lucide-react';

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

  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-gradient-to-br from-[#EAF6EF] to-white rounded-2xl p-4 border border-[#168A5B]/30 shadow-card space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#168A5B]/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#168A5B] text-white flex items-center justify-center shadow-xs">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-[#0F5132]">
              {t('reportDetails.cleanupCompleted')}
            </h2>
            {formattedDate && (
              <span className="text-[10px] text-[#64736A]">{formattedDate}</span>
            )}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#168A5B] text-white text-[10px] font-bold tracking-wider">
          100% RESOLVED
        </span>
      </div>

      {/* Before / After comparison */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Before */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#64736A] uppercase tracking-wider block">
            {t('reportDetails.before')}
          </span>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 border border-[#DCE7E1]">
            <img
              src={
                beforeImage ||
                'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80'
              }
              alt="Before Cleanup"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* After */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#168A5B] uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{t('reportDetails.after')}</span>
          </span>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-emerald-50 border-2 border-[#168A5B]/40 shadow-xs">
            <img
              src={
                afterImage ||
                'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=400&q=80'
              }
              alt="After Cleanup Verified"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-white/90 rounded-xl border border-[#168A5B]/20 text-center">
        <span className="text-xs font-bold text-[#0F5132] block">
          {t('reportDetails.cleanupVerified')}
        </span>
        <p className="text-[11px] text-[#64736A] mt-0.5">
          {t('reportDetails.cleanupVerifiedDesc')}
        </p>
      </div>
    </div>
  );
};
