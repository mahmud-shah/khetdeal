import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Phone, Lock, User, Building, Package, AlertTriangle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('farmer');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const roles = [
    { key: 'farmer', label: t('r_farmer'), icon: Wheat },
    { key: 'buyer', label: t('r_buyer'), icon: Building },
    { key: 'trader', label: t('r_trader'), icon: Package },
  ];

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await register({ name, phone, password: pass, role });
      nav('/dashboard');
    } catch (ex) {
      setErr(ex.message || 'Registration failed.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-[calc(100vh-240px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-farm-green to-farm-wheat flex items-center justify-center mx-auto mb-4">
            <Wheat size={24} className="text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">{t('reg_t')}</h2>
          <p className="text-xs sm:text-sm text-khet-500">{t('reg_s')}</p>
        </div>

        {err && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs sm:text-sm">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('ph_name')}</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-3.5 text-khet-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('ph_name')}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('ph_phone')}</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-3.5 text-khet-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('ph_pass')}</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5 text-khet-400" />
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-2">{t('ph_role')}</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-[11px] font-medium border-2 transition-all ${
                    role === r.key
                      ? 'border-farm-green bg-farm-green/10 text-farm-green dark:text-farm-light dark:border-farm-light'
                      : 'border-khet-200 dark:border-khet-700 text-khet-600 dark:text-khet-400'
                  }`}
                >
                  <r.icon size={16} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 disabled:opacity-50 mt-1"
          >
            {busy ? t('loading_reg') : t('btn_reg')}
          </button>

          <p className="text-center text-xs sm:text-sm text-khet-500">
            {t('has_acc')}{' '}
            <Link to="/login" className="text-farm-green dark:text-farm-light font-semibold no-underline">
              {t('nav_login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
