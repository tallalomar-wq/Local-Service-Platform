import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getBookingById,
  requestAdditionalPayment,
  respondToPaymentRequest,
  getPaymentAdjustments,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.put('/:id/status', authenticate, updateBookingStatus);

// Payment adjustment routes
router.post('/:bookingId/request-payment', authenticate, requestAdditionalPayment);
router.put('/adjustments/:adjustmentId/respond', authenticate, respondToPaymentRequest);
router.get('/:bookingId/adjustments', authenticate, getPaymentAdjustments);

export default router;
