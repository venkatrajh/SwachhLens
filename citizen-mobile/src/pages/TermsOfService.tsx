import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { FileCheck } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('legal.termsOfService', 'Terms of Service')}
        subtitle="Citizen Usage Guidelines"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="p-3.5 bg-[#EAF6EF] dark:bg-[#1A2C23] rounded-2xl border border-[#168A5B]/20 dark:border-[#39B77A]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <p className="text-xs text-[#0F5132] dark:text-[#F2F7F4] leading-relaxed">
              By using SwachhLens, you agree to help keep communities clean through honest and accurate reporting.
            </p>
          </div>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl p-4 border border-[#DCE7E1] dark:border-[#294037] shadow-card space-y-3.5 text-xs text-[#17211B] dark:text-[#F2F7F4] leading-relaxed">
            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                1. Responsible Civic Reporting
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                Citizens must submit authentic photos, videos, and coordinates of genuine waste issues. Submitting false, staged, offensive, or fraudulent reports is strictly prohibited.
              </p>
            </div>

            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                2. AI Triage & Response Times
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                AI priority estimates and dispatch recommendations assist municipal sanitation teams. Actual cleanup timeframes depend on local squad availability, severity rank, and weather conditions.
              </p>
            </div>

            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                3. Prohibited Misuse
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                You agree not to upload content depicting violence, personal identifying information of third parties without consent, or malicious materials.
              </p>
            </div>

            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                4. Service Availability & Account Termination
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                SwachhLens reserves the right to modify services, update algorithms, or suspend accounts violating civic community standards.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23]"
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    </div>
  );
};
