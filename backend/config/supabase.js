import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error('');
  console.error('─────────────────────────────────────────────────────────────');
  console.error('  ERROR: Missing environment variables:');
  missing.forEach((k) => console.error(`    • ${k}`));
  console.error('');
  console.error('  Copy backend/.env.example to backend/.env and fill in');
  console.error('  your Supabase project credentials.');
  console.error('─────────────────────────────────────────────────────────────');
  console.error('');
}

export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'placeholder-key'
);

export const db = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder-key'
);