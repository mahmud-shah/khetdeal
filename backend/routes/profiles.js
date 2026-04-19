import { Router } from 'express';
import { db } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { validate, profileSchema } from '../middleware/validate.js';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, name, role, avatar_url, bio, division, district, upazila, quality_score, completion_rate, deals_completed, is_verified, created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile: user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', authenticate, validate(profileSchema), async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .update(req.validated)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error) throw error;
    const { password, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;