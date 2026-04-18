import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Package, Loader2, User } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { CROP_EMOJI, CROP_BN } from '../lib/crops';
import { api } from '../services/api';

export default function Orders() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders
      .all()
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-farm-green/10 flex items-center justify-center">
          <ClipboardCheck size={20} className="text-farm-green dark:text-farm-light" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{t('orders_t')}</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-khet-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-khet-500 text-sm max-w-md mx-auto">{t('orders_empty')}</div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => {
            const isSeller = o.seller_id === user?.id;
            const counterparty = isSeller ? o.buyer : o.seller;
            const counterpartyRole = isSeller ? t('order_buyer') : t('order_seller');

            return (
              <div
                key={o.id}
                className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl sm:text-3xl shrink-0">{CROP_EMOJI[o.crop_name] || '🌱'}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold truncate">
                        {lang === 'bn' ? CROP_BN[o.crop_name] || o.crop_name : o.crop_name}
                      </h3>
                      <div className="text-[11px] text-khet-500">
                        {t('order_date')}: {new Date(o.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-farm-green/10 text-farm-green dark:text-farm-light shrink-0">
                    ✓ {o.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mb-3">
                  <div className="bg-khet-50 dark:bg-khet-800 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] text-khet-400 uppercase">{t('order_qty')}</div>
                    <div className="text-sm font-bold">
                      {o.quantity} <span className="text-[10px] font-normal">{t('mon')}</span>
                    </div>
                  </div>
                  <div className="bg-khet-50 dark:bg-khet-800 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] text-khet-400 uppercase">{t('order_price')}</div>
                    <div className="text-sm font-bold">
                      ৳{o.final_price}<span className="text-[10px] font-normal">/kg</span>
                    </div>
                  </div>
                  <div className="bg-khet-50 dark:bg-khet-800 rounded-lg px-2.5 py-1.5 col-span-2 xs:col-span-2">
                    <div className="text-[9px] text-khet-400 uppercase">{t('order_total')}</div>
                    <div className="text-sm font-bold text-farm-green dark:text-farm-light">
                      ৳{Number(o.total_amount).toLocaleString()}
                    </div>
                  </div>
                </div>

                {counterparty && (
                  <div className="flex items-center justify-between pt-3 border-t border-khet-100 dark:border-khet-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-khet-100 dark:bg-khet-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {counterparty.avatar_url ? (
                          <img src={counterparty.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={14} className="text-khet-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-khet-400 uppercase">{counterpartyRole}</div>
                        <Link
                          to={`/profile/${counterparty.id}`}
                          className="text-xs sm:text-sm font-semibold hover:text-farm-green no-underline truncate block"
                        >
                          {counterparty.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
