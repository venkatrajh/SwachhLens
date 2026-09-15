import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { LocationPicker } from '../components/common/LocationPicker';
import { User, Mail, Phone, CheckCircle2, AlertCircle, ArrowLeft, Save } from 'lucide-react';

export const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [ward, setWard] = useState(user?.ward || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await apiService.updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        ward: ward.trim() || undefined,
      });
      await refreshUser();
      setSuccessMessage('Profile details updated successfully.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to update profile.';
      setErrorMessage(detail);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('profile.editProfile', 'Edit Profile')}
        subtitle="Citizen Information"
        showBack={true}
      />
      <NatureBackground />

      <div className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar circle */}
          <div className="flex flex-col items-center py-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0F5132] to-[#168A5B] dark:from-[#168A5B] dark:to-[#39B77A] text-white flex items-center justify-center text-2xl font-extrabold shadow-md mb-2">
              {name ? name.charAt(0).toUpperCase() : 'C'}
            </div>
            <span className="text-xs font-bold text-[#168A5B] dark:text-[#39B77A]">
              Citizen Account
            </span>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('common.email', 'Email')} (Verified)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#1A2C23]/60 border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#64736A] dark:text-[#A9BBB1] cursor-not-allowed opacity-80 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('profile.phone', 'Phone Number')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs"
                />
              </div>
            </div>

            <div>
              <LocationPicker
                value={ward}
                onChange={(selectedWard) => setWard(selectedWard)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] active:scale-[0.98] text-white dark:text-[#0D1712] font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>

        <div className="pt-2 pb-2">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-[#14221B] text-[#17211B] dark:text-[#F2F7F4] font-bold text-xs border border-[#DCE7E1] dark:border-[#294037] shadow-card hover:bg-stone-50 dark:hover:bg-[#1A2C23] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back', 'Back to Profile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
