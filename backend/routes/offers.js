import { Router } from 'express';
import { db } from '../config/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, offerSchema } from '../middleware/validate.js';

const router = Router();

router.post('/', authenticate, authorize('buyer', 'trader'), validate(offerSchema), async (req, res) => {
  try {
    const { listing_id, offered_price, quantity, message } = req.validated;

    const { data: listing } = await db.from('listings').select('*').eq('id', listing_id).single();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ error: 'Listing is not available for offers' });
    if (listing.owner_id === req.user.id) return res.status(400).json({ error: 'Cannot offer on your own listing' });

    if (listing.is_urgent) {
      const floor = listing.price_per_kg * 0.8;
      if (offered_price < floor) {
        return res.status(400).json({ error: `Offer too low for urgent listing. Minimum: ৳${floor.toFixed(1)}/kg` });
      }
    }

    if (quantity > listing.quantity_max) {
      return res.status(400).json({ error: `Quantity exceeds available (max ${listing.quantity_max} mon)` });
    }

    const { data: offer, error } = await db
      .from('offers')
      .insert({ listing_id, buyer_id: req.user.id, offered_price, quantity, message, status: 'pending' })
      .select()
      .single();

    if (error) throw error;

    await db.from('listings').update({ status: 'negotiating' }).eq('id', listing_id);

    await db.from('notifications').insert({
      user_id: listing.owner_id,
      title: 'New offer received',
      message: `৳${offered_price}/kg for ${quantity} mon of ${listing.crop_name}`,
      type: 'offer',
      related_id: offer.id,
    });

    res.status(201).json({ offer });
  } catch (err) {
    console.error('Send offer error:', err);
    res.status(500).json({ error: 'Failed to send offer' });
  }
});

router.get('/received', authenticate, authorize('farmer', 'trader'), async (req, res) => {
  try {
    const { data: myListings } = await db.from('listings').select('id').eq('owner_id', req.user.id);
    const listingIds = (myListings || []).map((l) => l.id);

    if (listingIds.length === 0) return res.json({ offers: [] });

    const { data, error } = await db
      .from('offers')
      .select('*, listings!listing_id(id, crop_name, price_per_kg), users!buyer_id(id, name, phone, avatar_url)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ offers: data || [] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch received offers' });
  }
});

router.get('/sent', authenticate, async (req, res) => {
  try {
    const { data, error } = await db
      .from('offers')
      .select('*, listings!listing_id(id, crop_name, price_per_kg, owner_id, users!owner_id(id, name, phone, avatar_url))')
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ offers: data || [] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch sent offers' });
  }
});

router.patch('/:id', authenticate, authorize('farmer', 'trader'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const { data: offer } = await db
      .from('offers')
      .select('*, listings!listing_id(id, owner_id, crop_name)')
      .eq('id', req.params.id)
      .single();

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (offer.listings.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (offer.status !== 'pending') return res.status(400).json({ error: 'Offer already processed' });

    const { data: updated, error } = await db
      .from('offers')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (status === 'accepted') {

      await db.from('listings').update({ status: 'sold' }).eq('id', offer.listing_id);

      await db
        .from('offers')
        .update({ status: 'rejected' })
        .eq('listing_id', offer.listing_id)
        .neq('id', req.params.id)
        .eq('status', 'pending');

      await db.from('orders').insert({
        listing_id: offer.listing_id,
        seller_id: req.user.id,
        buyer_id: offer.buyer_id,
        crop_name: offer.listings.crop_name,
        quantity: offer.quantity,
        final_price: offer.offered_price,
        total_amount: offer.offered_price * offer.quantity * 40, // 1 mon ≈ 40 kg
        status: 'completed',
      });
    }

    await db.from('notifications').insert({
      user_id: offer.buyer_id,
      title: `Offer ${status}`,
      message: `Your offer on ${offer.listings.crop_name} was ${status}`,
      type: status,
      related_id: offer.id,
    });

    res.json({ offer: updated });
  } catch (err) {
    console.error('Process offer error:', err);
    res.status(500).json({ error: 'Failed to process offer' });
  }
});

export default router;
