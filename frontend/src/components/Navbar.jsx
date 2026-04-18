import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wheat, Sun, Moon, Globe, Menu, X, Home, Search, BarChart3, LogOut, User, Package, ClipboardCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { dark, toggle: toggleTheme } = useTheme();
  const { lang, t, toggle: toggleLang } = useLang();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  const isSeller = user?.role === 'farmer' || user?.role === 'trader';

  // Build the navigation links based on auth state + role
  const publicLinks = [
    { to: '/', label: t('nav_home'), icon: Home },
    { to: '/explore', label: t('nav_explore'), icon: Search },
  ];

  const userLinks = user
    ? [
        { to: '/dashboard', label: t('nav_dash'), icon: BarChart3 },
        { to: '/profile', label: t('nav_profile'), icon: User },
        ...(isSeller ? [{ to: '/dashboard?tab=listings', label: t('nav_listings'), icon: Package }] : []),
        { to: '/orders', label: t('nav_orders'), icon: ClipboardCheck },
      ]
    : [];

  const allLinks = [...publicLinks, ...userLinks];

  const active = (p) => loc.pathname === p.split('?')[0];
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    nav('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-farm-cream/92 dark:bg-khet-900/92 backdrop-blur-xl border-b border-khet-200 dark:border-khet-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          <Link to="/" className="flex items-center gap-2 no-underline shrink-0" onClick={close}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-farm-green to-farm-wheat flex items-center justify-center">
              <Wheat size={18} className="text-white" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight">{t('brand')}</span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {allLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                  active(l.to)
                    ? 'bg-farm-green/10 text-farm-green dark:text-farm-light'
                    : 'text-khet-500 hover:text-khet-800 dark:hover:text-khet-200 hover:bg-khet-100/50 dark:hover:bg-khet-800/50'
                }`}
              >
                <l.icon size={15} />
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleLang}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border border-khet-200 dark:border-khet-700 hover:bg-khet-100 dark:hover:bg-khet-800 transition-colors"
              style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
              aria-label="Toggle language"
            >
              <span className="flex items-center gap-1">
                <Globe size={12} />
                {lang === 'en' ? 'বাং' : 'EN'}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg border border-khet-200 dark:border-khet-700 hover:bg-khet-100 dark:hover:bg-khet-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-farm-green text-farm-green dark:text-farm-light dark:border-farm-light no-underline hover:bg-farm-green/5"
                  >
                    {t('nav_login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 no-underline hover:opacity-90"
                  >
                    {t('nav_reg')}
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={12} />
                  {t('nav_logout')}
                </button>
              )}
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-khet-100 dark:hover:bg-khet-800"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-khet-200 dark:border-khet-700 -mx-4 sm:-mx-5 px-4 sm:px-5 pt-3">
            <div className="flex flex-col gap-1">
              {allLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={close}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium no-underline ${
                    active(l.to)
                      ? 'bg-farm-green/10 text-farm-green dark:text-farm-light'
                      : 'text-khet-700 dark:text-khet-300 hover:bg-khet-100 dark:hover:bg-khet-800'
                  }`}
                >
                  <l.icon size={15} />
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={close}
                      className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-semibold border-2 border-farm-green text-farm-green dark:text-farm-light dark:border-farm-light no-underline"
                    >
                      {t('nav_login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={close}
                      className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 no-underline"
                    >
                      {t('nav_reg')}
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border-2 border-red-400 text-red-500"
                  >
                    <LogOut size={14} />
                    {t('nav_logout')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
