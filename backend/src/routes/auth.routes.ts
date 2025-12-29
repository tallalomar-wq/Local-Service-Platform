import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  verifyEmail,
  verifyPhone,
  resendEmailVerification,
  resendPhoneVerification,
  getAllUsers
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers); // Debug endpoint to view all users
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', authenticate, verifyPhone);
router.post('/resend-email-verification', authenticate, resendEmailVerification);
router.post('/resend-phone-verification', authenticate, resendPhoneVerification);

export default router;
