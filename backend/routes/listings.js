import { Router } from 'express';
import { db } from '../config/supabase.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, listingCreateSchema, listingUpdateSchema } from '../middleware/validate.js';

const router = Router();

// GET /api/listings — public browse with filters (all roles + guests)
router.get('/', async (req, res) => {
  try {
    const { crop, division, district, upazila, union, urgent, source, sort, owner, page = 1, limit = 20 } = req.query;

    let query = db
      .from('listings')
      .select('*, users!owner_id(id, name, phone, avatar_url, quality_score, completion_rate, is_verified)');

    // By default only show active listings, unless owner filter is set (then show all for that owner)
    if (owner) {
      query = query.eq('owner_id', owner);
    } else {
      query = query.eq('status', 'active');
    }

    if (crop) query = query.eq('crop_name', crop);
    if (division) query = query.eq('division', division);
    if (district) query = query.eq('district', district);
    if (upazila) query = query.eq('upazila', upazila);
    if (union) query = query.eq('union_name', union);
    if (urgent === 'true') query = query.eq('is_urgent', true);
    if (source) query = query.eq('source', source);

    if (sort === 'price_asc') query = query.order('price_per_kg', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price_per_kg', { ascending: false });
    else if (sort === 'quantity') query = query.order('quantity_max', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ listings: data || [] });
  } catch (err) {
    console.error('Fetch listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/listings/mine — current user's own listings (all statuses)
router.get('/mine', authenticate, async (req, res) => {
  try {
    const { data, error } = await db
      .from('listings')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ listings: data || [] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// GET /api/listings/:id — single listing detail
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await db
      .from('listings')
      .select('*, users!owner_id(id, name, phone, avatar_url, quality_score, completion_rate, is_verified)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Listing not found' });
    res.json({ listing: data });
  } catch {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// POST /api/listings — create new listing (farmer or trader only)
router.post('/', authenticate, authorize('farmer', 'trader'), validate(listingCreateSchema), async (req, res) => {
  try {
    const listing = {
      ...req.validated,
      owner_id: req.user.id,
      source: req.user.role === 'trader' ? 'trader' : 'farmer',
      status: 'active',
    };

    if (req.user.role === 'trader' && !listing.source_farm_price) {
      return res.status(400).json({ error: 'Trader listings must include source_farm_price' });
    }

    const { data, error } = await db.from('listings').insert(listing).select().single();
    if (error) throw error;

    res.status(201).json({ listing: data });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// PUT /api/listings/:id — update listing (owner only)
router.put('/:id', authenticate, authorize('farmer', 'trader'), validate(listingUpdateSchema), async (req, res) => {
  try {
    const { data: existing } = await db.from('listings').select('owner_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

    const { data, error } = await db
      .from('listings')
      .update(req.validated)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id — delete listing (owner only)
router.delete('/:id', authenticate, authorize('farmer', 'trader'), async (req, res) => {
  try {
    const { data: existing } = await db.from('listings').select('owner_id').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Listing not found' });
    if (existing.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

    const { error } = await db.from('listings').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// PATCH /api/listings/:id/status — change status (state machine)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      active: ['negotiating', 'cancelled'],
      negotiating: ['active', 'reserved', 'cancelled'],
      reserved: ['sold', 'active'],
    };

    const { data: listing } = await db.from('listings').select('status, owner_id').eq('id', req.params.id).single();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const allowed = validTransitions[listing.status];
    if (!allowed?.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${listing.status} to ${status}` });
    }

    const { data, error } = await db
      .from('listings')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ listing: data });
  } catch {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
