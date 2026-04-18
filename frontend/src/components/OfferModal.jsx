import { useState } from 'react';
import { X, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { CROP_EMOJI, CROP_BN } from '../lib/crops';
import { api } from '../services/api';

export default function OfferModal({ listing, onClose, onSent }) {
  const { lang, t } = useLang();
  const [sent, setSent] = useState(false);
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!listing) return null;

  const mkt = listing.market_price;
  const fairMin = mkt ? Math.round(mkt * 0.25) : null;
  const fairMax = mkt ? Math.round(mkt * 0.4) : null;

  const handleSend = async () => {
    setError('');
    setBusy(true);
    try {
      await api.offers.send({
        listing_id: listing.id,
        offered_price: Number(price),
        quantity: Number(qty),
        message: msg || undefined,
      });
      setSent(true);
      onSent?.();
    } catch (err) {
      setError(err.message || 'Failed to send offer');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-2xl p-5 sm:p-6 my-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-6">
            <CheckCircle size={44} className="mx-auto mb-4 text-farm-green dark:text-farm-light" />
            <h3 className="text-lg sm:text-xl font-bold mb-2">{t('offer_ok_t')}</h3>
            <p className="text-sm text-khet-500 mb-5">{t('offer_ok_s')}</p>
            <button
              onClick={onClose}
              className="px-7 py-2.5 rounded-xl text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90"
            >
              OK
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-5 gap-3">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold">{t('send_offer')}</h3>
                <p className="text-xs sm:text-sm text-khet-500 mt-1 truncate">
                  {CROP_EMOJI[listing.crop_name] || '🌱'} {lang === 'bn' ? CROP_BN[listing.crop_name] || listing.crop_name : listing.crop_name}
                </p>
              </div>
              <button onClick={onClose} className="p-1 text-khet-400 hover:text-khet-700 shrink-0" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs sm:text-sm">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('your_offer')}</label>
                <input
                  type="number"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={`Min ৳${listing.price_per_kg}`}
                  className="w-full px-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
                />
                {fairMin && (
                  <p className="text-[11px] text-farm-green dark:text-farm-light font-medium mt-1.5">
                    {t('fair')}: ৳{fairMin}–{fairMax}/kg
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('offer_qty')}</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder={`${listing.quantity_min}–${listing.quantity_max}`}
                  className="w-full px-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('offer_msg')}</label>
                <textarea
                  rows={3}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={t('offer_ph')}
                  className="w-full px-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm resize-y"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-khet-300 dark:border-khet-600 text-khet-600 dark:text-khet-400 hover:bg-khet-50 dark:hover:bg-khet-800"
                >
                  {t('btn_cancel')}
                </button>
                <button
                  onClick={handleSend}
                  disabled={busy || !price || !qty}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={15} /> {busy ? t('loading') : t('btn_offer')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
