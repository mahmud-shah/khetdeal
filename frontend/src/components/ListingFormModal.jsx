import { useState, useEffect } from 'react';
import { X, Wheat, AlertTriangle, Loader2 } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { DIVISIONS } from '../lib/crops';
import { api } from '../services/api';
import PhotoUpload from './PhotoUpload';

const emptyForm = {
  crop_name: '',
  quantity_min: '',
  quantity_max: '',
  price_per_kg: '',
  market_price: '',
  available_until: '',
  division: '',
  district: '',
  upazila: '',
  union_name: '',
  village: '',
  road_access: 'paved',
  is_urgent: false,
  description: '',
  contact_phone: '',
  source_farm_price: '',
  source_info: '',
  photos: [],
};

export default function ListingFormModal({ listing, onClose, onSaved }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const isEdit = !!listing;
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (listing) {
      setForm({
        ...emptyForm,
        ...listing,
        available_until: listing.available_until?.split('T')[0] || '',
        photos: listing.photos || [],
        market_price: listing.market_price || '',
        source_farm_price: listing.source_farm_price || '',
        source_info: listing.source_info || '',
        description: listing.description || '',
        contact_phone: listing.contact_phone || '',
      });
    }
  }, [listing]);

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      
      const payload = {
        ...form,
        quantity_min: Number(form.quantity_min),
        quantity_max: Number(form.quantity_max),
        price_per_kg: Number(form.price_per_kg),
      };
      if (form.market_price) payload.market_price = Number(form.market_price);
      else delete payload.market_price;
      if (form.source_farm_price) payload.source_farm_price = Number(form.source_farm_price);
      else delete payload.source_farm_price;
      if (!form.description) delete payload.description;
      if (!form.contact_phone) delete payload.contact_phone;
      if (!form.upazila) delete payload.upazila;
      if (!form.union_name) delete payload.union_name;
      if (!form.village) delete payload.village;
      if (!form.source_info) delete payload.source_info;

      if (isEdit) {
        await api.listings.update(listing.id, payload);
      } else {
        await api.listings.create(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save listing');
    }
    setBusy(false);
  };

  const roadOpts = [
    { key: 'paved', icon: '🛣️', label: t('road_p') },
    { key: 'unpaved', icon: '🌿', label: t('road_u') },
    { key: 'seasonal', icon: '🌊', label: t('road_s') },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-2xl p-5 sm:p-7 my-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5 gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">{isEdit ? t('edit_t') : t('create_t')}</h3>
            <p className="text-xs sm:text-sm text-khet-500 mt-1">{t('create_s')}</p>
          </div>
          <button onClick={onClose} className="p-1 text-khet-400 hover:text-khet-700" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs sm:text-sm">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('crop')} *</label>
            <input
              value={form.crop_name}
              onChange={update('crop_name')}
              placeholder={t('crop_ph')}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('qty_min')} *</label>
              <input
                type="number"
                value={form.quantity_min}
                onChange={update('quantity_min')}
                placeholder="35"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('qty_max')} *</label>
              <input
                type="number"
                value={form.quantity_max}
                onChange={update('quantity_max')}
                placeholder="50"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('price')} *</label>
              <input
                type="number"
                step="0.5"
                value={form.price_per_kg}
                onChange={update('price_per_kg')}
                placeholder="4.5"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('market_price')}</label>
              <input
                type="number"
                step="0.5"
                value={form.market_price}
                onChange={update('market_price')}
                placeholder="28"
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('avail')} *</label>
            <input
              type="date"
              value={form.available_until}
              onChange={update('available_until')}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('division')} *</label>
            <select
              value={form.division}
              onChange={update('division')}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
            >
              <option value="">{t('sel_div')}</option>
              {DIVISIONS.map((d) => (
                <option key={d.name} value={d.name}>
                  {lang === 'bn' ? d.bn : d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('district')} *</label>
              <input
                value={form.district}
                onChange={update('district')}
                placeholder={t('district')}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('upazila')}</label>
              <input
                value={form.upazila}
                onChange={update('upazila')}
                placeholder={t('upazila')}
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('union_l')}</label>
              <input
                value={form.union_name}
                onChange={update('union_name')}
                placeholder={t('union_l')}
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('village')}</label>
              <input
                value={form.village}
                onChange={update('village')}
                placeholder={t('village')}
                className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-2">{t('road')}</label>
            <div className="flex gap-2">
              {roadOpts.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, road_access: r.key }))}
                  className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs text-center border-2 transition-all ${
                    form.road_access === r.key
                      ? 'border-farm-green bg-farm-green/10 text-farm-green dark:text-farm-light dark:border-farm-light'
                      : 'border-khet-200 dark:border-khet-700 text-khet-600 dark:text-khet-400'
                  }`}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
              form.is_urgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-khet-50 dark:bg-khet-800'
            }`}
          >
            <input type="checkbox" checked={form.is_urgent} onChange={update('is_urgent')} className="w-4 h-4 accent-red-500" />
            <AlertTriangle size={15} className="text-red-500" />
            <span className="text-[11px] sm:text-xs font-medium text-red-600 dark:text-red-400">{t('urgent')}</span>
          </label>

          {user?.role === 'trader' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('farm_price')} *</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.source_farm_price}
                  onChange={update('source_farm_price')}
                  placeholder="5.5"
                  required={user.role === 'trader'}
                  className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('source_info')}</label>
                <input
                  value={form.source_info}
                  onChange={update('source_info')}
                  placeholder="12 farmers in Singra"
                  className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('description')}</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={update('description')}
              placeholder={t('description_ph')}
              className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('contact_phone')}</label>
            <input
              type="tel"
              value={form.contact_phone}
              onChange={update('contact_phone')}
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5">{t('photos')}</label>
            <PhotoUpload value={form.photos} onChange={(photos) => setForm((f) => ({ ...f, photos }))} />
            <p className="text-[10px] text-khet-400 mt-1">{t('photos_hint')}</p>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-khet-300 dark:border-khet-600 text-khet-600 dark:text-khet-400 hover:bg-khet-50 dark:hover:bg-khet-800"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Wheat size={15} />}
              {busy ? t('loading') : isEdit ? t('btn_save') : t('btn_pub')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
