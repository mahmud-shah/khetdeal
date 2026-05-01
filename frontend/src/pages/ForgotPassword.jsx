import { useState } from 'react';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.password.forgot({ identifier }); setSent(true); }
    finally { setBusy(false); }
  };

  if (sent) return (
    <div className="max-w-sm mx-auto p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Check your email or phone</h2>
      <p className="text-sm text-khet-500">If an account exists for {identifier}, instructions have been sent.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Forgot Password</h2>
      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
             placeholder="Email or phone (01XXXXXXXXX)" required
             className="w-full px-4 py-3 rounded-xl bg-khet-50 dark:bg-khet-800 border border-khet-200 dark:border-khet-700" />
      <button disabled={busy}
              className="w-full py-3 rounded-xl font-semibold bg-farm-green text-white disabled:opacity-50">
        {busy ? 'Sending…' : 'Send reset instructions'}
      </button>
    </form>
  );
}