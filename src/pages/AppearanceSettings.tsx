import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Laptop, Check, ArrowRight } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; labelKey: string; defaultLabel: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    {
      id: 'light',
      labelKey: 'settings.lightMode',
      defaultLabel: 'Light Mode',
      icon: Sun,
      desc: 'Crisp civic green with high-contrast neutral backgrounds',
    },
    {
      id: 'dark',
      labelKey: 'settings.darkMode',
      defaultLabel: 'Dark Mode',
      icon: Moon,
      desc: 'Deep forest and emerald tones easy on the eyes',
    },
    {
      id: 'system',
      labelKey: 'settings.systemMode',
      defaultLabel: 'System Preference',
      icon: Laptop,
      desc: 'Automatically matches your device operating system theme',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('settings.appearance', 'Appearance')}
        subtitle="Theme Preferences"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-xs text-[#64736A] dark:text-[#A9BBB1] px-1">
            Choose how SwachhLens appears on your device.
          </p>

          <div className="space-y-2.5">
            {themes.map((item) => {
              const isSelected = theme === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-[#14221B] border-[#168A5B] dark:border-[#39B77A] shadow-md ring-2 ring-[#168A5B]/20 dark:ring-[#39B77A]/20'
                      : 'bg-white dark:bg-[#14221B] border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#EAF6EF] dark:bg-[#1A2C23] text-[#168A5B] dark:text-[#39B77A]'
                          : 'bg-stone-100 dark:bg-[#1A2C23] text-[#64736A] dark:text-[#A9BBB1]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#17211B] dark:text-[#F2F7F4] block">
                        {t(item.labelKey, item.defaultLabel)}
                      </span>
                      <span className="text-[11px] text-[#64736A] dark:text-[#A9BBB1] leading-tight">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#168A5B] dark:bg-[#39B77A] text-white dark:text-[#0D1712] flex items-center justify-center shadow-xs flex-shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#DCE7E1] dark:border-[#294037] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] text-white dark:text-[#0D1712] font-bold text-xs flex items-center justify-center gap-2 shadow-floating active:scale-[0.98]"
          >
            <span>{t('common.save', 'Save Changes')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
