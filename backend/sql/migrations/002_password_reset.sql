-- Add email column to users (currently phone-only)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Reset tokens (email path) and OTP attempts (SMS path)
CREATE TABLE IF NOT EXISTS password_resets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,            -- SHA-256 of the raw token / OTP
  channel      TEXT NOT NULL CHECK (channel IN ('email','sms')),
  attempts     INT  NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pr_user_active
  ON password_resets(user_id) WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pr_hash ON password_resets(token_hash);