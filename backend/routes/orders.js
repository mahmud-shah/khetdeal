import { Router } from 'express';
import { db } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await db
      .from('orders')
      .select(`
        *,
        seller:users!seller_id(id, name, phone, avatar_url),
        buyer:users!buyer_id(id, name, phone, avatar_url)
      `)
      .or(`seller_id.eq.${id},buyer_id.eq.${id}`)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    res.json({ orders: data || [] });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await db
      .from('orders')
      .select(`
        *,
        seller:users!seller_id(id, name, phone, avatar_url),
        buyer:users!buyer_id(id, name, phone, avatar_url)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Order not found' });
    if (data.seller_id !== req.user.id && data.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ order: data });
  } catch {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;