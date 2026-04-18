import { TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export default function PriceData() {
  const { t, lang } = useLang();

  const sections = lang === 'bn'
    ? [
        {
          icon: BarChart3,
          title: 'বর্তমান বাজার মূল্য',
          body: 'প্রতিটি ফসলের জন্য ঢাকার পাইকারি বাজার মূল্য দেখুন। এই তথ্য খুঁজুন পেজে প্রতিটি তালিকায় প্রদর্শিত হয়।',
        },
        {
          icon: TrendingUp,
          title: 'ন্যায্য মূল্য পরিসর',
          body: 'প্রতিটি ফসলের জন্য আমরা একটি ন্যায্য খামার-গেট মূল্য পরিসর দেখাই (সাধারণত বাজার মূল্যের ২৫%-৪০%)। এটি কৃষক এবং ক্রেতাকে সঠিক দরদামের সাহায্য করে।',
        },
        {
          icon: DollarSign,
          title: 'জরুরি মূল্য নিরাপত্তা',
          body: 'জরুরি (পচনশীল) হিসেবে চিহ্নিত ফসলের জন্য ন্যূনতম মূল্য তালিকার ৮০% এ স্থির করা হয়, যাতে কৃষকরা চাপের মুখে শোষিত না হন।',
        },
      ]
    : [
        {
          icon: BarChart3,
          title: 'Current Market Prices',
          body: 'See Dhaka wholesale prices for each crop. This information is displayed on every listing on the Explore page to help everyone make informed decisions.',
        },
        {
          icon: TrendingUp,
          title: 'Fair Price Range',
          body: 'For each crop we show a fair farm-gate price range (typically 25%-40% of market price). This helps farmers and buyers negotiate transparently.',
        },
        {
          icon: DollarSign,
          title: 'Urgent Listing Floor',
          body: 'For crops marked urgent (perishable), the minimum offer is enforced at 80% of listed price so farmers under pressure are not exploited.',
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-farm-green/10 flex items-center justify-center shrink-0">
          <TrendingUp size={22} className="text-farm-green dark:text-farm-light" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('ft_price')}</h1>
          <p className="text-xs sm:text-sm text-khet-500 mt-0.5">
            {lang === 'bn' ? 'বাজার মূল্য স্বচ্ছতা' : 'Market price transparency'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <s.icon size={18} className="text-farm-green dark:text-farm-light mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-bold mb-1.5">{s.title}</h3>
                <p className="text-xs sm:text-sm text-khet-500 leading-relaxed">{s.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
