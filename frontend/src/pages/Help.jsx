import { HelpCircle, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export default function Help() {
  const { t, lang } = useLang();

  const sections = lang === 'bn'
    ? [
        {
          icon: BookOpen,
          title: 'কিভাবে শুরু করব?',
          body: 'নিবন্ধন করে একটি ভূমিকা নির্বাচন করুন (কৃষক, ক্রেতা, বা স্থানীয় ব্যবসায়ী)। কৃষক হিসেবে আপনি দাঁড়ানো ফসলের তালিকা তৈরি করতে পারবেন। ক্রেতা হিসেবে আপনি এলাকা ভিত্তিক ফসল খুঁজতে পারবেন।',
        },
        {
          icon: Zap,
          title: 'তালিকা কিভাবে তৈরি করব?',
          body: 'ড্যাশবোর্ডে গিয়ে "নতুন তালিকা" বাটনে ক্লিক করুন। ফসলের নাম, পরিমাণ, মূল্য, এবং অবস্থান দিন। ছবি আপলোড করতে পারেন (৩-৫টি প্রস্তাবিত)।',
        },
        {
          icon: MessageSquare,
          title: 'প্রস্তাব কিভাবে পাঠাব?',
          body: 'খুঁজুন পেজে কোনো তালিকায় "প্রস্তাব পাঠান" বাটনে ক্লিক করুন। আপনার মূল্য, পরিমাণ, এবং বার্তা দিন।',
        },
      ]
    : [
        {
          icon: BookOpen,
          title: 'Getting Started',
          body: 'Register an account and choose a role (Farmer, Buyer, or Local Trader). As a farmer you can list standing crops; as a buyer you can browse crops by location.',
        },
        {
          icon: Zap,
          title: 'How do I create a listing?',
          body: 'Go to your Dashboard and click "New Listing". Enter the crop name, quantity range, minimum price, and location down to village level. You can also upload 3-5 photos.',
        },
        {
          icon: MessageSquare,
          title: 'How do I send an offer?',
          body: 'On the Explore page, click "Send Offer" on any listing. Enter your price, quantity, and an optional message. The farmer will review and accept or reject.',
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-farm-green/10 flex items-center justify-center shrink-0">
          <HelpCircle size={22} className="text-farm-green dark:text-farm-light" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('ft_help')}</h1>
          <p className="text-xs sm:text-sm text-khet-500 mt-0.5">
            {lang === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্ন' : 'Frequently Asked Questions'}
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
