import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { forgotPassword, verifyOtp, resetPassword } from '../controllers/passwordController.js';

const router = Router();

const strict = rateLimit({ windowMs: 15 * 60_000, max: 5,
  message: { error: 'Too many attempts. Try again later.' } });

router.post('/forgot',     strict, forgotPassword);
router.post('/verify-otp', strict, verifyOtp);
router.post('/reset',      strict, resetPassword);

export default router;