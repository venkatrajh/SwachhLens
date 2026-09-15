import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, User, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const hideNavPaths = ['/camera', '/analyzing', '/preview', '/login', '/register'];
  if (hideNavPaths.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto glass-nav px-3 py-2 border-t border-[#DCE7E1] dark:border-[#294037] safe-bottom shadow-lg"
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        {/* Home */}
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[56px] py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#168A5B] dark:text-[#39B77A] font-bold'
                : 'text-[#64736A] dark:text-[#A9BBB1] hover:text-[#17211B] dark:hover:text-[#F2F7F4]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[#EAF6EF] dark:bg-[#1A2C23]' : 'bg-transparent'
                }`}
              >
                <Home className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 font-medium">{t('common.home')}</span>
            </>
          )}
        </NavLink>

        {/* Central Report Action Button */}
        <NavLink
          to="/report"
          className="flex flex-col items-center -mt-5 group min-h-[44px] min-w-[60px]"
          aria-label="Report Waste"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#0F5132] via-[#168A5B] to-[#22A06B] dark:from-[#168A5B] dark:via-[#39B77A] dark:to-[#22A06B] text-white dark:text-[#0D1712] flex items-center justify-center shadow-floating group-active:scale-95 transition-transform border-4 border-white dark:border-[#14221B]">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-[#168A5B] dark:text-[#39B77A] mt-1">
            {t('report.title')}
          </span>
        </NavLink>

        {/* My Reports */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[56px] py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#168A5B] dark:text-[#39B77A] font-bold'
                : 'text-[#64736A] dark:text-[#A9BBB1] hover:text-[#17211B] dark:hover:text-[#F2F7F4]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[#EAF6EF] dark:bg-[#1A2C23]' : 'bg-transparent'
                }`}
              >
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 font-medium">
                {t('common.reports')}
              </span>
            </>
          )}
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[56px] py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#168A5B] dark:text-[#39B77A] font-bold'
                : 'text-[#64736A] dark:text-[#A9BBB1] hover:text-[#17211B] dark:hover:text-[#F2F7F4]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[#EAF6EF] dark:bg-[#1A2C23]' : 'bg-transparent'
                }`}
              >
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-0.5 font-medium">
                {t('common.profile')}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
