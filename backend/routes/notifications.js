import { Router } from 'express';
import { db } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ notifications: data || [] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const { count, error } = await db
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { data, error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ notification: data });
  } catch {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
