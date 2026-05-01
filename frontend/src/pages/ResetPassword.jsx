import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (pw !== pw2) return setErr('Passwords do not match');
    if (pw.length < 8) return setErr('Password must be at least 8 characters');
    setBusy(true);
    try {
      await api.password.reset({ token, newPassword: pw });
      navigate('/login', { replace: true });
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (!token) return <p className="p-6 text-center">Invalid reset link.</p>;

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Set a new password</h2>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
             placeholder="New password (min 8 chars)" required
             className="w-full px-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700" />
      <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)}
             placeholder="Confirm new password" required
             className="w-full px-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700" />
      {err && <p className="text-sm text-red-500">{err}</p>}
      <button disabled={busy}
              className="w-full py-3 rounded-xl font-semibold bg-farm-green text-white disabled:opacity-50">
        {busy ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}