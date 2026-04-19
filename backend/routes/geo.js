import { Router } from 'express';
import { db } from '../config/supabase.js';

const router = Router();
const levels = ['division', 'district', 'upazila', 'union'];
router.get('/crops', async (req, res) => {
  try {
    const { data, error } = await db
      .from('listings')
      .select('crop_name')
      .eq('status', 'active');
    if (error) throw error;

    const uniqueCrops = [...new Set((data || []).map((l) => l.crop_name))].sort();
    res.json({ crops: uniqueCrops });
  } catch {
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

router.get('/aggregate', async (req, res) => {
  try {
    const { crop, level, division, district, upazila } = req.query;

    if (!crop) return res.status(400).json({ error: 'crop parameter required' });
    if (!['division', 'district', 'upazila', 'union'].includes(level)) {
      return res.status(400).json({ error: 'level must be division, district, upazila, or union' });
    }

    const { data, error } = await db.rpc('get_crop_aggregates', {
      p_crop: crop,
      p_level: level,
      p_division: division || null,
      p_district: district || null,
      p_upazila: upazila || null,
    });

    if (error) throw error;
    res.json({ areas: data || [] });
  } catch (err) {
    console.error('Geo aggregate error:', err);
    res.status(500).json({ error: 'Failed to fetch geographic data' });
  }
});

export default router;

