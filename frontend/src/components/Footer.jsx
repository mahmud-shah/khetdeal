import { Link } from 'react-router-dom';
import { Wheat } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export default function Footer() {
  const { t } = useLang();

  const cols = [
    {
      title: t('ft_prod'),
      items: [
        { label: t('ft_exp'), to: '/explore' },
        { label: t('ft_price'), to: '/price-data' },
      ],
    },
    {
      title: t('ft_sup'),
      items: [
        { label: t('ft_help'), to: '/help' },
        { label: t('ft_contact'), to: '/contact' },
        { label: t('ft_priv'), to: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="bg-khet-900 text-khet-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3 no-underline">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-farm-light to-farm-wheat flex items-center justify-center">
                <Wheat size={16} className="text-white" />
              </div>
              <span className="text-base font-bold text-khet-100">{t('brand')}</span>
            </Link>
            <p className="text-xs leading-relaxed">{t('ft_desc')}</p>
          </div>

          {cols.map((col, i) => (
            <div key={i}>
              <h4 className="text-khet-100 text-xs font-semibold mb-3 uppercase tracking-wider">{col.title}</h4>
              <div className="flex flex-col gap-2 text-xs">
                {col.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="text-khet-400 hover:text-khet-100 transition-colors no-underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-khet-800 pt-4 flex justify-between flex-wrap gap-2 text-[11px]">
          <span>
            © 2025 {t('brand')}. {t('ft_rights')}.
          </span>
          <span>{t('ft_made')}</span>
        </div>
      </div>
    </footer>
  );
}
