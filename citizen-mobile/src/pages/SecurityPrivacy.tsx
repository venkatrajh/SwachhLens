import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { Shield, Lock, MapPin, Eye, FileText, ChevronRight } from 'lucide-react';

export const SecurityPrivacy: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const securityItems = [
    {
      icon: Lock,
      title: 'Password & Authentication',
      desc: 'Your credentials and sessions are securely protected. We never store or transmit plaintext passwords.',
    },
    {
      icon: MapPin,
      title: 'Location & GPS Privacy',
      desc: 'Location coordinates are captured solely for dispatching municipal sanitation teams to the reported waste site.',
    },
    {
      icon: Eye,
      title: 'Report Data & Media',
      desc: 'Uploaded photos and videos are analyzed for waste classification, volume estimation, and cleanup verification.',
    },
    {
      icon: Shield,
      title: 'Civic Data Protection',
      desc: 'Your citizen profile information is restricted to authorized municipal decision engines and resolution teams.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('settings.securityPrivacy', 'Security & Privacy')}
        subtitle="Citizen Protection"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="p-4 bg-[#EAF6EF] dark:bg-[#1A2C23] rounded-2xl border border-[#168A5B]/20 dark:border-[#39B77A]/20 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0F5132] dark:text-[#F2F7F4]">
                Transparent & Respectful Privacy
              </h2>
              <p className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] mt-0.5 leading-relaxed">
                SwachhLens is designed to empower citizens while upholding strict privacy standards for civic waste reporting.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {securityItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-3.5 bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct link to Privacy Policy */}
          <button
            type="button"
            onClick={() => navigate('/privacy-policy')}
            className="w-full p-3.5 bg-white dark:bg-[#14221B] rounded-2xl border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#168A5B] dark:text-[#39B77A]" />
              <span className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4]">
                {t('legal.privacyPolicy', 'Read Full Privacy Policy')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
          </button>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23]"
          >
            {t('common.back', 'Back to Settings')}
          </button>
        </div>
      </div>
    </div>
  );
};
