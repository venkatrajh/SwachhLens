import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('legal.privacyPolicy', 'Privacy Policy')}
        subtitle="SwachhLens Data Policy"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs leading-relaxed">
            <strong>Hackathon MVP Notice:</strong> This privacy policy explains how SwachhLens processes civic reporting data in the current evaluation prototype.
          </div>

          <div className="bg-white dark:bg-[#14221B] rounded-2xl p-4 border border-[#DCE7E1] dark:border-[#294037] shadow-card space-y-3.5 text-xs text-[#17211B] dark:text-[#F2F7F4] leading-relaxed">
            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                1. Information We Collect
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                When you submit a waste report, SwachhLens collects:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[#64736A] dark:text-[#A9BBB1]">
                <li>Photographs or video evidence of the waste incident.</li>
                <li>Geographical location (GPS or user-selected map coordinates).</li>
                <li>Report creation timestamps.</li>
                <li>Optional descriptions provided by the citizen.</li>
                <li>Account identifier and contact preferences.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                2. AI Analysis & Processing
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                Uploaded media is processed by AI classification models to calculate waste severity scores, classify material types, detect duplicate complaints, and recommend sanitation team assignments.
              </p>
            </div>

            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                3. Data Usage & Sharing
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                Report data is shared exclusively with municipal authorities and designated field response teams to facilitate waste clearance and verification. We do not sell or monetize personal citizen data.
              </p>
            </div>

            <div>
              <h2 className="font-extrabold text-sm text-[#0F5132] dark:text-[#39B77A] mb-1">
                4. Notification Preferences & Control
              </h2>
              <p className="text-[#64736A] dark:text-[#A9BBB1]">
                Citizens have full control over push notifications and status updates via the application settings at any time.
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
