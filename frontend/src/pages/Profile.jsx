import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, MapPin, Phone, Calendar, Edit, Save, X, Star, CheckCircle, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { DIVISIONS } from '../lib/crops';
import { api } from '../services/api';
import PhotoUpload from '../components/PhotoUpload';

export default function Profile() {
  const { t, lang } = useLang();
  const { user, refresh } = useAuth();
  const { id: paramId } = useParams();

  const isOwnProfile = !paramId || paramId === user?.id;
  const targetId = paramId || user?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    api.profiles
      .get(targetId)
      .then((d) => {
        setProfile(d.profile);
        setForm({
          name: d.profile.name || '',
          bio: d.profile.bio || '',
          birth_date: d.profile.birth_date?.split('T')[0] || '',
          avatar_url: d.profile.avatar_url || '',
          division: d.profile.division || '',
          district: d.profile.district || '',
          upazila: d.profile.upazila || '',
          union_name: d.profile.union_name || '',
          village: d.profile.village || '',
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleSave = async () => {
    setError('');
    setBusy(true);
    try {
      const payload = { ...form };
      if (!payload.bio) payload.bio = null;
      if (!payload.birth_date) payload.birth_date = null;
      if (!payload.avatar_url) payload.avatar_url = null;

      const res = await api.profiles.updateMe(payload);
      setProfile((p) => ({ ...p, ...res.user }));
      await refresh();
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    }
    setBusy(false);
  };

  const updateField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const getRoleLabel = (role) => {
    if (role === 'trader') return lang === 'bn' ? 'স্থানীয় ব্যবসায়ী' : 'Local Trader';
    if (role === 'buyer') return lang === 'bn' ? 'ক্রেতা' : 'Buyer';
    if (role === 'farmer') return lang === 'bn' ? 'কৃষক' : 'Farmer';
    return role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-khet-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-khet-500">Profile not found</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {isOwnProfile ? t('prof_t') : profile.name}
        </h2>
        {isOwnProfile && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90"
          >
            <Edit size={13} /> {t('prof_edit')}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs sm:text-sm">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-farm-soil border border-khet-200 dark:border-khet-700 rounded-2xl p-5 sm:p-7">
        {/* Avatar and role */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b border-khet-200 dark:border-khet-700">
          <div className="relative shrink-0">
            {editing ? (
              <PhotoUpload
                value={form.avatar_url ? [form.avatar_url] : []}
                onChange={(arr) => setForm((f) => ({ ...f, avatar_url: arr[0] || '' }))}
                bucket="avatars"
                max={1}
                multiple={false}
              />
            ) : profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-khet-200 dark:border-khet-700"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-farm-green to-farm-wheat flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0 w-full">
            {editing ? (
              <input
                value={form.name}
                onChange={updateField('name')}
                className="w-full text-xl font-bold px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 mb-2"
              />
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-xl sm:text-2xl font-bold">{profile.name}</h3>
                {profile.is_verified && (
                  <Shield size={16} className="text-farm-green dark:text-farm-light" aria-label="Verified" />
                )}
              </div>
            )}
            <p className="text-sm text-khet-500 mb-2">{getRoleLabel(profile.role)}</p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-khet-500">
              {profile.quality_score > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-farm-wheat" /> {profile.quality_score}/5
                </span>
              )}
              <span className="flex items-center gap-1">
                <CheckCircle size={12} className="text-farm-green" /> {profile.deals_completed || 0} {t('prof_deals')}
              </span>
              <span>
                {t('prof_member')} {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-khet-500 mb-1.5 uppercase tracking-wider">
            {t('prof_bio')}
          </label>
          {editing ? (
            <textarea
              rows={3}
              value={form.bio}
              onChange={updateField('bio')}
              placeholder={t('prof_bio_ph')}
              className="w-full px-4 py-2.5 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-sm resize-y"
            />
          ) : (
            <p className="text-sm text-khet-600 dark:text-khet-300">{profile.bio || '—'}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-khet-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} /> {t('prof_location')}
          </label>
          {editing ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              <select
                value={form.division}
                onChange={updateField('division')}
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
                value={form.district}
                onChange={updateField('district')}
                placeholder={t('district')}
                className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
              />
              <input
                value={form.upazila}
                onChange={updateField('upazila')}
                placeholder={t('upazila')}
                className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
              />
              <input
                value={form.union_name}
                onChange={updateField('union_name')}
                placeholder={t('union_l')}
                className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
              />
              <input
                value={form.village}
                onChange={updateField('village')}
                placeholder={t('village')}
                className="px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs col-span-full"
              />
            </div>
          ) : (
            <p className="text-sm text-khet-600 dark:text-khet-300">
              {[profile.village, profile.upazila, profile.district, profile.division].filter(Boolean).join(', ') || '—'}
            </p>
          )}
        </div>

        {/* Birth date + Phone */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-semibold text-khet-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> {t('prof_birth')}
            </label>
            {editing ? (
              <input
                type="date"
                value={form.birth_date}
                onChange={updateField('birth_date')}
                className="w-full px-3 py-2 rounded-lg bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700 text-xs"
              />
            ) : (
              <p className="text-sm text-khet-600 dark:text-khet-300">
                {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString() : '—'}
              </p>
            )}
          </div>

          {isOwnProfile && user?.phone && (
            <div>
              <label className="block text-xs font-semibold text-khet-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Phone size={12} /> {t('ph_phone')}
              </label>
              <p className="text-sm text-khet-600 dark:text-khet-300">{user.phone}</p>
            </div>
          )}
        </div>

        {/* Save / cancel */}
        {editing && (
          <div className="flex gap-2 pt-4 border-t border-khet-200 dark:border-khet-700">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 border-khet-300 dark:border-khet-600 text-khet-600 dark:text-khet-400 hover:bg-khet-50 dark:hover:bg-khet-800"
            >
              <X size={14} className="inline mr-1" /> {t('prof_cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-farm-green dark:bg-farm-light text-white dark:text-khet-900 hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="inline animate-spin mr-1" /> : <Save size={14} className="inline mr-1" />}
              {t('prof_save')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
