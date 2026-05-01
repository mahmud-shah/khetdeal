import crypto from 'node:crypto';
import { db } from '../config/supabase.js';

const RAW_TOKEN_BYTES = 32;
const EMAIL_TTL_MIN = 30;
const SMS_TTL_MIN = 10;
const MAX_OTP_ATTEMPTS = 5;

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export async function issueEmailToken(userId) {
  await db.from('password_resets').delete().eq('user_id', userId).is('consumed_at', null);

  const raw = crypto.randomBytes(RAW_TOKEN_BYTES).toString('base64url');
  const expires_at = new Date(Date.now() + EMAIL_TTL_MIN * 60_000).toISOString();

  const { error } = await db.from('password_resets').insert({
    user_id: userId, token_hash: sha256(raw), channel: 'email', expires_at,
  });
  if (error) throw error;
  return raw;
}

export async function issueOtp(userId) {
  await db.from('password_resets').delete().eq('user_id', userId).is('consumed_at', null);

  // 6-digit, no leading-zero ambiguity for users
  const otp = String(crypto.randomInt(100000, 1000000));
  const expires_at = new Date(Date.now() + SMS_TTL_MIN * 60_000).toISOString();

  const { error } = await db.from('password_resets').insert({
    user_id: userId, token_hash: sha256(otp), channel: 'sms', expires_at,
  });
  if (error) throw error;
  return otp;
}

export async function consumeToken({ rawToken, channel, userId = null }) {
  const hash = sha256(rawToken);
  let q = db.from('password_resets').select('*').eq('token_hash', hash).eq('channel', channel)
            .is('consumed_at', null).gt('expires_at', new Date().toISOString());
  if (userId) q = q.eq('user_id', userId);

  const { data: row } = await q.maybeSingle();
  if (!row) return { ok: false, reason: 'invalid_or_expired' };

  if (channel === 'sms' && row.attempts >= MAX_OTP_ATTEMPTS) {
    return { ok: false, reason: 'locked' };
  }

  const { data: updated, error } = await db.from('password_resets')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id).is('consumed_at', null).select().maybeSingle();
  if (error || !updated) return { ok: false, reason: 'race' };

  return { ok: true, userId: row.user_id };
}

export async function bumpAttempt(userId) {
  await db.rpc('increment_pr_attempt', { p_user_id: userId });
}