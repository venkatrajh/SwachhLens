import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopHeader } from '../components/layout/TopHeader';
import { NatureBackground } from '../components/layout/NatureBackground';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Check, Save } from 'lucide-react';

export const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Kavin Kumar');
  const [email, setEmail] = useState(user?.email || 'kavin@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [ward, setWard] = useState(user?.ward || 'Ward 117 - T. Nagar, Zone 10');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Update local user state in localStorage
    if (user) {
      const updated = {
        ...user,
        name,
        email,
        phone,
        ward,
      };
      localStorage.setItem('swachhlens_auth_user', JSON.stringify(updated));
    }
    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/profile');
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAF8] dark:bg-[#0D1712] flex flex-col justify-between">
      <TopHeader
        title={t('profile.editProfile', 'Edit Profile')}
        subtitle="Citizen Information"
        showBack={true}
      />
      <NatureBackground />

      <form
        onSubmit={handleSave}
        className="relative z-10 px-4 py-4 space-y-4 flex-1 flex flex-col justify-between"
      >
        <div className="space-y-4">
          {/* Avatar circle */}
          <div className="flex flex-col items-center py-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0F5132] to-[#168A5B] dark:from-[#168A5B] dark:to-[#39B77A] text-white flex items-center justify-center text-2xl font-extrabold shadow-md mb-2">
              {name ? name.charAt(0) : 'K'}
            </div>
            <span className="text-xs font-bold text-[#168A5B] dark:text-[#39B77A]">
              Citizen Account
            </span>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-[#EAF6EF] dark:bg-[#1A2C23] border border-[#168A5B]/30 rounded-xl text-center text-xs font-bold text-[#0F5132] dark:text-[#39B77A] flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Profile changes saved successfully!</span>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('common.email', 'Email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 shadow-xs"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
                {t('profile.ward', 'Ward / Locality')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1]" />
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-sm text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#168A5B] hover:bg-[#13754D] dark:bg-[#39B77A] dark:hover:bg-[#2fa069] text-white dark:text-[#0D1712] font-bold text-xs flex items-center justify-center gap-2 shadow-floating active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{t('profile.saveChanges', 'Save Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
