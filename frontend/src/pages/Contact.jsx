import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export default function Contact() {
  const { t, lang } = useLang();

  const items = [
    {
      icon: Mail,
      label: lang === 'bn' ? 'ইমেইল' : 'Email',
      value: 'support@khetdeal.bd',
    },
    {
      icon: Phone,
      label: lang === 'bn' ? 'ফোন' : 'Phone',
      value: '+880 1700-000000',
    },
    {
      icon: MapPin,
      label: lang === 'bn' ? 'ঠিকানা' : 'Address',
      value: lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-farm-green/10 flex items-center justify-center shrink-0">
          <MessageCircle size={22} className="text-farm-green dark:text-farm-light" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('ft_contact')}</h1>
          <p className="text-xs sm:text-sm text-khet-500 mt-0.5">
            {lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in touch with us'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-5 sm:p-7 mb-6">
        <p className="text-sm text-khet-600 dark:text-khet-300 leading-relaxed mb-5">
          {lang === 'bn'
            ? 'আপনার যেকোনো প্রশ্ন, পরামর্শ, বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করব।'
            : 'Have questions, feedback, or need help? Reach out to our team. We aim to respond within 24 hours.'}
        </p>

        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-khet-50 dark:bg-khet-800 flex items-center justify-center shrink-0">
                <item.icon size={15} className="text-farm-green dark:text-farm-light" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-khet-400 uppercase tracking-wider">{item.label}</div>
                <div className="text-sm font-semibold truncate">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
