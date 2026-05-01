import Hero from '../components/home/Hero';
import { Link } from 'react-router-dom';
import { Wheat, Search, CheckCircle, Shield, Layers, TrendingUp, Zap, Users, Building, Map, ArrowRight, Leaf } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export default function Landing() {
  const { t } = useLang();

  const steps = [
    { icon: Wheat, title: t('how_1t'), desc: t('how_1d'), num: '১' },
    { icon: Search, title: t('how_2t'), desc: t('how_2d'), num: '২' },
    { icon: CheckCircle, title: t('how_3t'), desc: t('how_3d'), num: '৩' },
  ];

  const features = [
    { icon: Shield, title: t('f1t'), desc: t('f1d'), color: 'text-farm-green dark:text-farm-light', bg: 'bg-farm-green/10' },
    { icon: Layers, title: t('f2t'), desc: t('f2d'), color: 'text-farm-wheat', bg: 'bg-farm-wheat/10' },
    { icon: TrendingUp, title: t('f3t'), desc: t('f3d'), color: 'text-farm-green dark:text-farm-light', bg: 'bg-farm-green/10' },
    { icon: Zap, title: t('f4t'), desc: t('f4d'), color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div>
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-5 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)' }}
        />
        <div className="max-w-2xl mx-auto relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-farm-green/10 text-farm-green dark:text-farm-light mb-4">
            <Leaf size={13} /> {t('tagline')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">{t('hero_title')}</h1>
          <p className="text-sm sm:text-base md:text-lg text-khet-500 dark:text-khet-400 leading-relaxed mb-8 max-w-xl mx-auto px-2 sm:px-0">
            {t('hero_sub')}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 no-underline"
            >
              {t('hero_cta')} <ArrowRight size={16} />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold border-2 border-farm-green dark:border-farm-light text-farm-green dark:text-farm-light hover:bg-farm-green/5 no-underline"
            >
              {t('hero_explore')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 px-4 sm:px-5 bg-khet-100/60 dark:bg-khet-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-8 sm:mb-12">{t('how_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-5 sm:p-6 relative">
                <div
                  className="absolute -top-3 left-5 w-7 h-7 rounded-full bg-farm-green text-white flex items-center justify-center text-sm font-extrabold"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  {step.num}
                </div>
                <step.icon size={24} className="text-farm-green dark:text-farm-light mb-3 mt-1" />
                <h3 className="text-sm sm:text-base font-bold mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-khet-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14 px-4 sm:px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-8 sm:mb-12">{t('feat_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="text-sm sm:text-base font-bold mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-khet-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
