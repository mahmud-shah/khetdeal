import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/supabase.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// Surfaces missing env vars early so users get a clear message
function checkConfig() {
  const missing = [];
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_KEY');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (missing.length > 0) {
    return `Server config missing: ${missing.join(', ')}. Check backend/.env file.`;
  }
  return null;
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const configErr = checkConfig();
  if (configErr) return res.status(500).json({ error: configErr });

  try {
    const { name, phone, password, role } = req.validated;

    const { data: existing, error: checkErr } = await db
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (checkErr) {
      console.error('Phone check error:', checkErr);
      return res.status(500).json({
        error: `Database check failed: ${checkErr.message}. Did you run backend/sql/schema.sql in Supabase?`,
      });
    }

    if (existing) {
      return res.status(409).json({ error: 'This phone number is already registered. Please log in instead.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { data: user, error: insertErr } = await db
      .from('users')
      .insert({ name, phone, password: hashed, role })
      .select('*')
      .single();

    if (insertErr) {
      console.error('Insert error:', insertErr);
      return res.status(500).json({
        error: `Could not create account: ${insertErr.message}. Check that the users table exists in Supabase.`,
      });
    }

    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: `Registration failed: ${err.message}` });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const configErr = checkConfig();
  if (configErr) return res.status(500).json({ error: configErr });

  try {
    const { phone, password } = req.validated;

    const { data: user, error: fetchErr } = await db
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (fetchErr) {
      console.error('Fetch error:', fetchErr);
      return res.status(500).json({
        error: `Database error: ${fetchErr.message}. Did you run backend/sql/schema.sql?`,
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: `Login failed: ${err.message}` });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch user: ${err.message}` });
  }
});

export default router;
