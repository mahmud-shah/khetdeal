import { Shield } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

export default function Privacy() {
  const { t, lang } = useLang();

  const sections = lang === 'bn'
    ? [
        {
          title: '১. আমরা কি সংগ্রহ করি',
          body: 'নিবন্ধনের সময় আমরা আপনার নাম, ফোন নম্বর, ভূমিকা, এবং অবস্থান সংগ্রহ করি। আপনি ইচ্ছা করলে প্রোফাইল ছবি, জন্ম তারিখ, এবং পরিচিতি যোগ করতে পারেন।',
        },
        {
          title: '২. তথ্য কিভাবে ব্যবহার করি',
          body: 'আপনার তথ্য শুধুমাত্র প্ল্যাটফর্ম পরিচালনা, ফসল তালিকা প্রদর্শন, এবং ক্রেতা-বিক্রেতার মধ্যে সংযোগ স্থাপনের জন্য ব্যবহৃত হয়। আমরা আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।',
        },
        {
          title: '৩. আপনার অধিকার',
          body: 'আপনি যেকোনো সময় আপনার প্রোফাইল সম্পাদনা বা মুছে ফেলতে পারেন। আপনার তালিকা মুছে দিলে তা সম্পূর্ণভাবে সরানো হয়।',
        },
      ]
    : [
        {
          title: '1. What we collect',
          body: 'At registration we collect your name, phone number, role, and location. Optionally you can add a profile picture, birth date, and bio through your profile page.',
        },
        {
          title: '2. How we use your information',
          body: 'Your information is used only to operate the platform, display crop listings, and connect buyers with sellers. We do not sell your data to third parties.',
        },
        {
          title: '3. Your rights',
          body: 'You can edit or delete your profile information at any time. When you delete a listing it is permanently removed from our database.',
        },
        {
          title: '4. Data security',
          body: 'Passwords are hashed using bcrypt. API access is protected by JWT authentication and rate-limited to prevent abuse.',
        },
        {
          title: '5. Contact',
          body: 'For privacy concerns, email support@khetdeal.bd or use our Contact page.',
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-farm-green/10 flex items-center justify-center shrink-0">
          <Shield size={22} className="text-farm-green dark:text-farm-light" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('ft_priv')}</h1>
          <p className="text-xs sm:text-sm text-khet-500 mt-0.5">
            {lang === 'bn' ? 'শেষ আপডেট: এপ্রিল ২০২৫' : 'Last updated: April 2025'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-xl p-5 sm:p-7">
        <div className="flex flex-col gap-5">
          {sections.map((s, i) => (
            <div key={i}>
              <h3 className="text-sm sm:text-base font-bold mb-1.5">{s.title}</h3>
              <p className="text-xs sm:text-sm text-khet-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
