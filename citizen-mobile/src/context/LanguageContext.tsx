import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import type { LanguageOption } from '../i18n';

interface LanguageContextType {
  currentLanguage: string;
  currentLanguageDetails: LanguageOption;
  languages: LanguageOption[];
  changeLanguage: (code: string) => void;
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  const currentLanguage = (i18n.language || 'en').split('-')[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('swachhlens_language', code);
    setIsLanguageModalOpen(false);
  };

  const currentLanguageDetails =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLanguageDetails,
        languages: SUPPORTED_LANGUAGES,
        changeLanguage,
        isLanguageModalOpen,
        openLanguageModal: () => setIsLanguageModalOpen(true),
        closeLanguageModal: () => setIsLanguageModalOpen(false),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
