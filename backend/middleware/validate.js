import { z } from 'zod';

const bdPhone = z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh phone number');

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: bdPhone,
  password: z.string().min(6).max(100),
  role: z.enum(['farmer', 'buyer', 'trader']),
});

export const loginSchema = z.object({
  phone: bdPhone,
  password: z.string().min(1),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  division: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  upazila: z.string().nullable().optional(),
  union_name: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
});

const listingBase = {
  crop_name: z.string().min(1).max(100),
  quantity_min: z.number().positive(),
  quantity_max: z.number().positive(),
  price_per_kg: z.number().positive(),
  market_price: z.number().positive().optional(),
  available_until: z.string(),
  division: z.string().min(1),
  district: z.string().min(1),
  upazila: z.string().optional(),
  union_name: z.string().optional(),
  village: z.string().optional(),
  road_access: z.enum(['paved', 'unpaved', 'seasonal']).default('paved'),
  is_urgent: z.boolean().default(false),
  description: z.string().max(1000).optional(),
  contact_phone: bdPhone.optional(),
  photos: z.array(z.string().url()).default([]),
  source_farm_price: z.number().positive().optional(),
  source_info: z.string().optional(),
};

export const listingCreateSchema = z.object(listingBase).refine(
  (d) => d.quantity_max >= d.quantity_min,
  { message: 'Max quantity must be >= min quantity' }
);

export const listingUpdateSchema = z.object(
  Object.fromEntries(Object.entries(listingBase).map(([k, v]) => [k, v.optional()]))
);

export const offerSchema = z.object({
  listing_id: z.string().uuid(),
  offered_price: z.number().positive(),
  quantity: z.number().positive(),
  message: z.string().max(500).optional(),
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.validated = result.data;
    next();
  };
}
