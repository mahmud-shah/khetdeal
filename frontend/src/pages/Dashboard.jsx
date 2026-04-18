import { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle, TrendingUp, Plus, Send, Bell, Eye, Check, XCircle, Loader2, Wallet } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import ListingCard from '../components/ListingCard';
import ListingFormModal from '../components/ListingFormModal';

export default function Dashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const isSeller = user?.role === 'farmer' || user?.role === 'trader';
  const isBuyer = user?.role === 'buyer';

  const [tab, setTab] = useState('listings');
  const [stats, setStats] = useState({ active: 0, negotiating: 0, completed: 0, earnings: 0 });
  const [myListings, setMyListings] = useState([]);
  const [offersIn, setOffersIn] = useState([]);
  const [offersOut, setOffersOut] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.stats();
      setStats(s);

      if (isSeller) {
        const [ml, off, nt] = await Promise.all([api.listings.mine(), api.offers.received(), api.notifs.all()]);
        setMyListings(ml.listings || []);
        setOffersIn(off.offers || []);
        setNotifs(nt.notifications || []);
      } else if (isBuyer) {
        const [off, nt] = await Promise.all([api.offers.sent(), api.notifs.all()]);
        setOffersOut(off.offers || []);
        setNotifs(nt.notifications || []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  }, [isSeller, isBuyer]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDelete = async (listing) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      await api.listings.delete(listing.id);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setShowForm(true);
  };

  const handleNewListing = () => {
    setEditingListing(null);
    setShowForm(true);
  };

  const handleOfferRespond = async (offerId, status) => {
    try {
      await api.offers.respond(offerId, status);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  // Build tabs list based on role
  const tabs = isSeller
    ? [
        { key: 'listings', label: t('tab_list'), icon: Package },
        { key: 'offers_in', label: t('tab_offers_in'), icon: Send },
        { key: 'notifs', label: t('tab_notif'), icon: Bell },
      ]
    : [
        { key: 'offers_out', label: t('tab_offers_out'), icon: Send },
        { key: 'notifs', label: t('tab_notif'), icon: Bell },
      ];

  useEffect(() => {
    // Default tab based on role
    setTab(isSeller ? 'listings' : 'offers_out');
  }, [isSeller]);

  const statCards = isSeller
    ? [
        { label: t('d_active'), value: stats.active, icon: Package, color: 'text-farm-green dark:text-farm-light', bg: 'bg-farm-green/10' },
        { label: t('d_neg'), value: stats.negotiating, icon: Clock, color: 'text-farm-wheat', bg: 'bg-farm-wheat/10' },
        { label: t('d_completed'), value: stats.completed, icon: CheckCircle, color: 'text-farm-green dark:text-farm-light', bg: 'bg-farm-green/10' },
        { label: t('d_earn'), value: `৳${Number(stats.earnings).toLocaleString()}`, icon: TrendingUp, color: 'text-farm-wheat', bg: 'bg-farm-wheat/10' },
      ]
    : [
        { label: t('o_pending'), value: stats.active, icon: Clock, color: 'text-farm-wheat', bg: 'bg-farm-wheat/10' },
        { label: t('o_accepted'), value: stats.completed, icon: CheckCircle, color: 'text-farm-green dark:text-farm-light', bg: 'bg-farm-green/10' },
        { label: t('d_spent'), value: `৳${Number(stats.earnings).toLocaleString()}`, icon: Wallet, color: 'text-farm-wheat', bg: 'bg-farm-wheat/10' },
      ];

  const notifIcons = { offer: Send, view: Eye, accepted: CheckCircle, rejected: XCircle };

  const getRoleLabel = () => {
    if (user?.role === 'trader') return lang === 'bn' ? 'স্থানীয় ব্যবসায়ী' : 'Local Trader';
    if (user?.role === 'buyer') return lang === 'bn' ? 'ক্রেতা' : 'Buyer';
    return lang === 'bn' ? 'কৃষক' : 'Farmer';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5">
          {t('d_welcome')}, {user?.name} 👋
        </h2>
        <p className="text-xs sm:text-sm text-khet-500">{getRoleLabel()}</p>
      </div>

      <div className={`grid grid-cols-2 ${isSeller ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2.5 sm:gap-3 mb-6`}>
        {statCards.map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-extrabold truncate">{s.value}</div>
              <div className="text-[10px] sm:text-[11px] text-khet-500 truncate">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center border-b border-khet-200 dark:border-khet-700 mb-5 overflow-x-auto scrollbar-thin">
        <div className="flex gap-0.5 shrink-0">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                tab === tb.key
                  ? 'border-farm-green text-farm-green dark:text-farm-light dark:border-farm-light'
                  : 'border-transparent text-khet-500 hover:text-khet-700 dark:hover:text-khet-300'
              }`}
            >
              <tb.icon size={14} /> {tb.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {isSeller && (
          <button
            onClick={handleNewListing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 shrink-0 ml-2"
          >
            <Plus size={14} /> {t('new_list')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-khet-400" />
        </div>
      ) : (
        <>
          {tab === 'listings' && isSeller && (
            <>
              {myListings.length === 0 ? (
                <div className="text-center py-12 text-khet-500 text-sm max-w-md mx-auto">{t('empty_listings')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {myListings.map((l) => (
                    <ListingCard key={l.id} listing={l} canEdit onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'offers_in' && isSeller && (
            <>
              {offersIn.length === 0 ? (
                <div className="text-center py-12 text-khet-500 text-sm max-w-md mx-auto">{t('empty_offers_in')}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {offersIn.map((o) => {
                    const buyer = o.users || {};
                    const listing = o.listings || {};
                    return (
                      <div
                        key={o.id}
                        className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">{buyer.name || '—'}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                o.status === 'pending'
                                  ? 'bg-farm-wheat/10 text-farm-wheat'
                                  : o.status === 'accepted'
                                  ? 'bg-farm-green/10 text-farm-green'
                                  : 'bg-red-100 text-red-500'
                              }`}
                            >
                              {t('o_' + o.status)}
                            </span>
                          </div>
                          <div className="text-xs text-khet-500 mb-1.5">
                            {listing.crop_name} — {o.message || '—'}
                          </div>
                          <div className="text-xs sm:text-sm">
                            <strong>৳{o.offered_price}/kg</strong> · {o.quantity} {t('mon')}
                          </div>
                        </div>
                        {o.status === 'pending' && (
                          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                            <button
                              onClick={() => handleOfferRespond(o.id, 'accepted')}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90"
                            >
                              <Check size={13} /> {t('accept')}
                            </button>
                            <button
                              onClick={() => handleOfferRespond(o.id, 'rejected')}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <XCircle size={13} /> {t('reject')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'offers_out' && isBuyer && (
            <>
              {offersOut.length === 0 ? (
                <div className="text-center py-12 text-khet-500 text-sm max-w-md mx-auto">{t('empty_offers_out')}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {offersOut.map((o) => {
                    const listing = o.listings || {};
                    const seller = listing.users || {};
                    return (
                      <div
                        key={o.id}
                        className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm mb-1">
                            {listing.crop_name} — {seller.name || '—'}
                          </div>
                          <div className="text-xs text-khet-500 mb-1.5">{o.message || '—'}</div>
                          <div className="text-xs sm:text-sm">
                            <strong>৳{o.offered_price}/kg</strong> · {o.quantity} {t('mon')}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                            o.status === 'pending'
                              ? 'bg-farm-wheat/10 text-farm-wheat'
                              : o.status === 'accepted'
                              ? 'bg-farm-green/10 text-farm-green'
                              : 'bg-red-100 text-red-500'
                          }`}
                        >
                          {t('o_' + o.status)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'notifs' && (
            <>
              {notifs.length === 0 ? (
                <div className="text-center py-12 text-khet-500 text-sm max-w-md mx-auto">{t('empty_notifs')}</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notifs.map((n) => {
                    const Icon = notifIcons[n.type] || Bell;
                    return (
                      <div
                        key={n.id}
                        className={`bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-3 sm:p-4 flex items-center gap-3 ${
                          n.is_read ? 'opacity-60' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${
                            n.is_read ? 'bg-khet-100 dark:bg-khet-800' : 'bg-farm-green/10'
                          }`}
                        >
                          <Icon size={14} className={n.is_read ? 'text-khet-400' : 'text-farm-green dark:text-farm-light'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs sm:text-sm font-semibold`}>{n.title}</div>
                          <div className="text-[11px] text-khet-500 mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-khet-400 mt-0.5">
                            {new Date(n.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-farm-green dark:bg-farm-light shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {showForm && (
        <ListingFormModal
          listing={editingListing}
          onClose={() => {
            setShowForm(false);
            setEditingListing(null);
          }}
          onSaved={loadAll}
        />
      )}
    </div>
  );
}
