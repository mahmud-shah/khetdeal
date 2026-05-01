import bcrypt from 'bcryptjs';
import { db } from '../config/supabase.js';
import { issueEmailToken, issueOtp, consumeToken, bumpAttempt } from '../services/tokenService.js';
import { sendResetEmail } from '../services/mailService.js';
import { sendOtpSms } from '../services/smsService.js';

const GENERIC = { message: 'If an account exists, instructions have been sent.' };

export async function forgotPassword(req, res) {
  const { identifier } = req.body || {};
  if (!identifier) return res.status(400).json({ error: 'identifier required' });

  const isEmail = identifier.includes('@');
  const col = isEmail ? 'email' : 'phone';

  const { data: user } = await db.from('users')
    .select('id, name, email, phone').eq(col, identifier).maybeSingle();

  if (!user) {
    await bcrypt.hash('decoy', 10);
    return res.json(GENERIC);
  }

  try {
    if (isEmail) {
      const raw = await issueEmailToken(user.id);
      await sendResetEmail(user.email, raw, user.name);
    } else {
      const otp = await issueOtp(user.id);
      await sendOtpSms(user.phone, otp);
    }
  } catch (err) {
    console.error('forgotPassword dispatch error:', err);
  }
  return res.json(GENERIC);
}

export async function verifyOtp(req, res) {
  const { phone, otp } = req.body || {};
  if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });

  const { data: user } = await db.from('users').select('id').eq('phone', phone).maybeSingle();
  if (!user) return res.status(400).json({ error: 'Invalid code' });

  await bumpAttempt(user.id);
  const result = await consumeToken({ rawToken: otp, channel: 'sms', userId: user.id });
  if (!result.ok) return res.status(400).json({ error: 'Invalid or expired code' });

  const raw = await issueEmailToken(user.id);
  return res.json({ resetTicket: raw });
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const result = await consumeToken({ rawToken: token, channel: 'email' });
  if (!result.ok) return res.status(400).json({ error: 'Reset link is invalid or expired' });

  const hashed = await bcrypt.hash(newPassword, 12);
  const { error } = await db.from('users').update({ password: hashed }).eq('id', result.userId);
  if (error) return res.status(500).json({ error: 'Could not update password' });

  await db.from('password_resets').delete().eq('user_id', result.userId).is('consumed_at', null);

  return res.json({ message: 'Password updated. Please log in.' });
}