import { Router } from 'express';
import { db } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'farmer' || role === 'trader') {

      const { data: listings } = await db
        .from('listings')
        .select('status')
        .eq('owner_id', id);

      const counts = { active: 0, negotiating: 0, reserved: 0, sold: 0 };
      (listings || []).forEach((l) => {
        if (counts[l.status] !== undefined) counts[l.status]++;
      });

      const { data: orders } = await db
        .from('orders')
        .select('total_amount')
        .eq('seller_id', id)
        .eq('status', 'completed');

      const earnings = (orders || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
      const completed = (orders || []).length;

      return res.json({
        active: counts.active,
        negotiating: counts.negotiating + counts.reserved,
        completed,
        earnings: Math.round(earnings),
      });
    }

    if (role === 'buyer') {

      const { data: offers } = await db
        .from('offers')
        .select('status')
        .eq('buyer_id', id);

      const counts = { pending: 0, accepted: 0, rejected: 0 };
      (offers || []).forEach((o) => {
        if (counts[o.status] !== undefined) counts[o.status]++;
      });

      const { data: orders } = await db
        .from('orders')
        .select('total_amount')
        .eq('buyer_id', id)
        .eq('status', 'completed');

      const spent = (orders || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
      const completed = (orders || []).length;

      return res.json({
        active: counts.pending,
        negotiating: counts.pending,
        completed,
        earnings: Math.round(spent),
      });
    }

    res.json({ active: 0, negotiating: 0, completed: 0, earnings: 0 });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
