import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Star, CheckCircle, User, Package, Send, Edit, Trash2 } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { CROP_EMOJI, CROP_BN } from '../lib/crops';

export default function ListingCard({ listing, canOffer = false, onOffer, canEdit = false, onEdit, onDelete }) {
  const { lang, t } = useLang();
  const isTrader = listing.source === 'trader';
  const owner = listing.users || {};

  const statusColors = {
    active: 'text-farm-green bg-farm-green/10',
    negotiating: 'text-farm-wheat bg-farm-wheat/10',
    reserved: 'text-purple-500 bg-purple-500/10',
    sold: 'text-khet-400 bg-khet-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  };

  const statusKey = {
    active: 'st_active',
    negotiating: 'st_neg',
    reserved: 'st_res',
    sold: 'st_sold',
    cancelled: 'st_cancelled',
  };

  const roadIcons = { paved: '🛣️', unpaved: '🌿', seasonal: '🌊' };
  const roadKey = { paved: 'road_p', unpaved: 'road_u', seasonal: 'road_s' };

  const mkt = listing.market_price;
  const fairMin = mkt ? Math.round(mkt * 0.25) : null;
  const fairMax = mkt ? Math.round(mkt * 0.4) : null;

  return (
    <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {listing.is_urgent && (
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-red-500">
          <AlertTriangle size={13} />
          {t('urg_label')}
        </div>
      )}

      {listing.photos && listing.photos.length > 0 && (
        <div className="aspect-[16/9] bg-khet-100 dark:bg-khet-800 overflow-hidden">
          <img src={listing.photos[0]} alt={listing.crop_name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0">{CROP_EMOJI[listing.crop_name] || '🌱'}</span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate">
                {lang === 'bn' ? CROP_BN[listing.crop_name] || listing.crop_name : listing.crop_name}
              </h3>
              {owner.id ? (
                <Link to={`/profile/${owner.id}`} className="flex items-center gap-1 text-[11px] sm:text-xs text-khet-500 hover:text-farm-green no-underline">
                  {isTrader ? <Package size={11} /> : <User size={11} />}
                  <span className="truncate">{owner.name}</span>
                  {isTrader && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                      Trader
                    </span>
                  )}
                </Link>
              ) : (
                <div className="text-[11px] text-khet-500">—</div>
              )}
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 whitespace-nowrap ${statusColors[listing.status] || ''}`}>
            {t(statusKey[listing.status])}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-khet-50 dark:bg-khet-800 rounded-lg px-2.5 sm:px-3 py-2">
            <div className="text-[9px] text-khet-400 font-medium uppercase tracking-wider">{t('yield_l')}</div>
            <div className="text-sm sm:text-base font-bold">
              {listing.quantity_min}–{listing.quantity_max}
              <span className="text-[10px] font-normal ml-1">{t('mon')}</span>
            </div>
          </div>
          <div className="bg-khet-50 dark:bg-khet-800 rounded-lg px-2.5 sm:px-3 py-2">
            <div className="text-[9px] text-khet-400 font-medium uppercase tracking-wider">{t('min_p')}</div>
            <div className="text-sm sm:text-base font-bold">
              ৳{listing.price_per_kg}
              <span className="text-[10px] font-normal">/kg</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-khet-500 mb-2">
          <MapPin size={12} className="text-farm-green dark:text-farm-light shrink-0" />
          <span className="truncate">
            {[listing.village, listing.upazila, listing.district].filter(Boolean).join(', ')}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-3 text-[10px] text-khet-500">
          <span className="flex items-center gap-0.5">
            {roadIcons[listing.road_access]} {t(roadKey[listing.road_access])}
          </span>
          {owner.quality_score > 0 && (
            <span className="flex items-center gap-0.5">
              <Star size={10} className="text-farm-wheat" /> {owner.quality_score}
            </span>
          )}
          {owner.completion_rate != null && (
            <span className="flex items-center gap-0.5">
              <CheckCircle size={10} className="text-farm-green" /> {owner.completion_rate}%
            </span>
          )}
          {listing.photos?.length > 0 && <span>📷 {listing.photos.length}</span>}
        </div>

        {isTrader && listing.source_farm_price && (
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg px-2.5 py-1.5 mb-3 text-[10px] border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium flex-wrap gap-1">
              <span>{t('prov')}: {listing.source_info || '—'}</span>
              <span>{t('t_margin')}: ৳{(listing.price_per_kg - listing.source_farm_price).toFixed(1)}</span>
            </div>
            <div className="text-khet-500 mt-0.5">
              {t('f_price')}: ৳{listing.source_farm_price} → {t('t_price')}: ৳{listing.price_per_kg}
            </div>
          </div>
        )}

        {mkt && (
          <div className="bg-farm-wheat/10 rounded-lg px-2.5 py-1.5 mb-3 text-[10px] flex justify-between items-center gap-2 flex-wrap">
            <span className="text-khet-500">
              {t('mkt')}: <strong className="text-khet-800 dark:text-khet-200">৳{mkt}</strong>
            </span>
            <span className="text-farm-green dark:text-farm-light font-semibold whitespace-nowrap">
              {t('fair')}: ৳{fairMin}–{fairMax}
            </span>
          </div>
        )}

        {canOffer && listing.status === 'active' && (
          <button
            onClick={() => onOffer?.(listing)}
            className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 transition-opacity"
          >
            <Send size={14} /> {t('send_offer')}
          </button>
        )}

        {canEdit && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onEdit?.(listing)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border-2 border-khet-300 dark:border-khet-600 text-khet-700 dark:text-khet-300 hover:bg-khet-50 dark:hover:bg-khet-800"
            >
              <Edit size={13} /> {t('edit')}
            </button>
            <button
              onClick={() => onDelete?.(listing)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={13} /> {t('delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
