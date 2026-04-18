import { useState, useEffect } from 'react';
import { Map, ArrowLeft, ChevronRight, Clock, Search, Filter, Loader2 } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { CROP_EMOJI, CROP_BN, DIVISIONS } from '../lib/crops';
import { api } from '../services/api';
import ListingCard from '../components/ListingCard';
import OfferModal from '../components/OfferModal';

export default function Explore() {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCrops, setAvailableCrops] = useState([]);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [filterDist, setFilterDist] = useState('');
  const [filterUpz, setFilterUpz] = useState('');
  const [filterUnion, setFilterUnion] = useState('');
  const [searchCrop, setSearchCrop] = useState('');

  // Geographic browse drill-down (only works when a crop is selected)
  const [geoPath, setGeoPath] = useState([]); // [{level, name}]
  const [geoAreas, setGeoAreas] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const [offerOn, setOfferOn] = useState(null);

  // Load distinct crops that actually have listings
  useEffect(() => {
    api.geo
      .crops()
      .then((d) => setAvailableCrops(d.crops || []))
      .catch(() => setAvailableCrops([]));
  }, []);

  // Load listings (respects all filters)
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCrop) params.crop = selectedCrop;
    if (filterDiv) params.division = filterDiv;
    if (filterDist) params.district = filterDist;
    if (filterUpz) params.upazila = filterUpz;
    if (filterUnion) params.union = filterUnion;

    api.listings
      .all(params)
      .then((d) => setListings(d.listings || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [selectedCrop, filterDiv, filterDist, filterUpz, filterUnion]);

  // Load geographic aggregation (only when a crop is selected)
  useEffect(() => {
    if (!selectedCrop) {
      setGeoAreas([]);
      setGeoPath([]);
      return;
    }

    const levels = ['division', 'district', 'upazila', 'union'];
    const level = levels[geoPath.length];
    if (!level) return;

    const params = { crop: selectedCrop, level };
    if (geoPath[0]) params.division = geoPath[0].name;
    if (geoPath[1]) params.district = geoPath[1].name;
    if (geoPath[2]) params.upazila = geoPath[2].name;

    setGeoLoading(true);
    api.geo
      .aggregate(params)
      .then((d) => setGeoAreas(d.areas || []))
      .catch(() => setGeoAreas([]))
      .finally(() => setGeoLoading(false));
  }, [selectedCrop, geoPath]);

  // Filter crops by search
  const filteredCrops = availableCrops.filter((c) => {
    if (!searchCrop) return true;
    const q = searchCrop.toLowerCase();
    return c.toLowerCase().includes(q) || (CROP_BN[c] || '').includes(searchCrop);
  });

  // Drill down into geographic level
  const drillInto = (area) => {
    const levels = ['division', 'district', 'upazila', 'union'];
    const currentLevel = levels[geoPath.length];
    setGeoPath([...geoPath, { level: currentLevel, name: area.name }]);
  };

  const drillBack = () => {
    setGeoPath(geoPath.slice(0, -1));
  };

  const clearFilters = () => {
    setFilterDiv('');
    setFilterDist('');
    setFilterUpz('');
    setFilterUnion('');
  };

  const hasActiveFilters = filterDiv || filterDist || filterUpz || filterUnion;

  const geoLevelLabel = (() => {
    const labels = [
      lang === 'bn' ? 'বিভাগ' : 'Divisions',
      lang === 'bn' ? 'জেলা' : 'Districts',
      lang === 'bn' ? 'উপজেলা' : 'Upazilas',
      lang === 'bn' ? 'ইউনিয়ন' : 'Unions',
    ];
    return labels[geoPath.length] || labels[0];
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{t('exp_t')}</h2>
      <p className="text-xs sm:text-sm text-khet-500 mb-5">{t('exp_s')}</p>

      {/* ─── Find a Crop (search + pick) ─── */}
      <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-farm-green dark:text-farm-light" />
          <h3 className="text-sm font-bold">{t('find_crop')}</h3>
        </div>
        <input
          type="text"
          value={searchCrop}
          onChange={(e) => setSearchCrop(e.target.value)}
          placeholder={t('crop_ph')}
          className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm mb-3"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedCrop('');
              setGeoPath([]);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-colors ${
              !selectedCrop
                ? 'bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 border-farm-green dark:border-farm-light'
                : 'bg-white dark:bg-khet-800 border-khet-200 dark:border-khet-700 text-khet-700 dark:text-khet-300 hover:border-farm-green'
            }`}
          >
            {t('all_crops')}
          </button>
          {filteredCrops.length === 0 && searchCrop && (
            <span className="text-xs text-khet-400 py-1.5">{t('no_results')}</span>
          )}
          {filteredCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => {
                setSelectedCrop(crop);
                setGeoPath([]);
              }}
              className={`flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-colors ${
                selectedCrop === crop
                  ? 'bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 border-farm-green dark:border-farm-light'
                  : 'bg-white dark:bg-khet-800 border-khet-200 dark:border-khet-700 text-khet-700 dark:text-khet-300 hover:border-farm-green'
              }`}
            >
              {CROP_EMOJI[crop] || '🌱'} {lang === 'bn' ? CROP_BN[crop] || crop : crop}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Geographic filters (for listing list) ─── */}
      <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-farm-green dark:text-farm-light" />
            <h3 className="text-sm font-bold">{t('filter_div')}</h3>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[11px] text-farm-green dark:text-farm-light font-semibold">
              {t('clear_filters')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={filterDiv}
            onChange={(e) => {
              setFilterDiv(e.target.value);
              setFilterDist('');
              setFilterUpz('');
              setFilterUnion('');
            }}
            className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
          >
            <option value="">{t('division')}</option>
            {DIVISIONS.map((d) => (
              <option key={d.name} value={d.name}>
                {lang === 'bn' ? d.bn : d.name}
              </option>
            ))}
          </select>
          <input
            value={filterDist}
            onChange={(e) => setFilterDist(e.target.value)}
            placeholder={t('district')}
            className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
          />
          <input
            value={filterUpz}
            onChange={(e) => setFilterUpz(e.target.value)}
            placeholder={t('upazila')}
            className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
          />
          <input
            value={filterUnion}
            onChange={(e) => setFilterUnion(e.target.value)}
            placeholder={t('union_l')}
            className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 items-start">
        {/* ─── Geographic Browse (only enabled when crop selected) ─── */}
        <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl overflow-hidden md:sticky md:top-20">
          <div className="px-4 py-3 border-b border-khet-200 dark:border-khet-700 flex items-center gap-2 font-bold text-xs sm:text-sm">
            <Map size={16} className="text-farm-green dark:text-farm-light shrink-0" />
            <span className="truncate">
              {t('geo_browse')}
              {selectedCrop && ` — ${geoLevelLabel}`}
            </span>
          </div>

          {!selectedCrop ? (
            <div className="px-4 py-8 text-center text-[11px] text-khet-400">{t('select_crop')}</div>
          ) : (
            <>
              {geoPath.length > 0 && (
                <button
                  onClick={drillBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] sm:text-xs font-medium text-farm-green dark:text-farm-light w-full text-left hover:bg-khet-50 dark:hover:bg-khet-800"
                >
                  <ArrowLeft size={13} /> {t('go_back')}
                </button>
              )}

              {geoPath.length > 0 && (
                <div className="px-4 py-2 text-[10px] text-khet-500 border-b border-khet-100 dark:border-khet-800">
                  {geoPath.map((p) => p.name).join(' › ')}
                </div>
              )}

              {geoLoading ? (
                <div className="p-6 text-center">
                  <Loader2 size={16} className="mx-auto animate-spin text-khet-400" />
                </div>
              ) : geoAreas.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-khet-400">{t('no_listings_area')}</div>
              ) : (
                <div>
                  {geoAreas.map((area) => (
                    <button
                      key={area.name}
                      onClick={() => geoPath.length < 3 && drillInto(area)}
                      className="flex items-center justify-between w-full px-4 py-3 border-b border-khet-100 dark:border-khet-800 text-left hover:bg-khet-50 dark:hover:bg-khet-800 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold truncate">{area.name}</div>
                        <div className="text-[10px] text-khet-500 mt-0.5">
                          {Number(area.total_stock).toLocaleString()} {t('mon')} · {area.farmer_count}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-farm-green dark:text-farm-light font-semibold">
                          ৳{Number(area.min_price).toFixed(1)}
                        </span>
                        {geoPath.length < 3 && <ChevronRight size={14} className="text-khet-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Listings ─── */}
        <div>
          {user && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-farm-green/10 text-farm-green dark:text-farm-light mb-4">
              <Clock size={13} /> {lang === 'bn' ? 'সরাসরি ক্রেতা অগ্রাধিকার' : 'Direct buyer priority'}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-khet-400" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-khet-400 text-sm">{t('no_results')}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {listings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  canOffer={!!user && (user.role === 'buyer' || user.role === 'trader') && l.users?.id !== user.id}
                  onOffer={setOfferOn}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {offerOn && <OfferModal listing={offerOn} onClose={() => setOfferOn(null)} />}
    </div>
  );
}
