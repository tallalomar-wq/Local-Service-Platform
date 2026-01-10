import { Request, Response } from 'express';
import { Booking, ProviderProfile, User, ServiceCategory, PaymentAdjustment } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';
import { NotificationController } from './notification.controller';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      providerId,
      serviceCategoryId,
      serviceDate,
      serviceTime,
      duration,
      address,
      city,
      state,
      zipCode,
      description,
      estimatedCost,
    } = req.body;

    const provider = await ProviderProfile.findByPk(providerId);
    if (!provider || !['active', 'trial'].includes(provider.subscriptionStatus)) {
      res.status(400).json({ message: 'Provider not available' });
      return;
    }

    const commission = estimatedCost ? estimatedCost * 0.1 : 0;

    const booking = await Booking.create({
      customerId: req.user.id,
      providerId,
      serviceCategoryId,
      serviceDate,
      serviceTime,
      duration,
      address,
      city,
      state,
      zipCode,
      description,
      estimatedCost,
      commission,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Send notification to provider
    await NotificationController.createNotification(
      providerId,
      'booking',
      'New Booking Request',
      `You have a new booking request for ${serviceDate} at ${serviceTime}`,
      booking.id,
      'booking'
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.user;
    const { status } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    let bookings;
    if (role === 'customer') {
      whereClause.customerId = req.user.id;
      bookings = await Booking.findAll({
        where: whereClause,
        include: [
          {
            model: ProviderProfile,
            as: 'provider',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'phone', 'avatar'],
              },
            ],
          },
          {
            model: ServiceCategory,
            as: 'serviceCategory',
          },
        ],
        order: [['serviceDate', 'DESC']],
      });
    } else if (role === 'provider') {
      const provider = await ProviderProfile.findOne({ where: { userId: req.user.id } });
      if (!provider) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
      }

      whereClause.providerId = provider.id;
      bookings = await Booking.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['firstName', 'lastName', 'phone', 'email', 'avatar'],
          },
          {
            model: ServiceCategory,
            as: 'serviceCategory',
          },
        ],
        order: [['serviceDate', 'DESC']],
      });
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, finalCost, cancellationReason } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const updates: any = { status };
    if (finalCost) {
      updates.finalCost = finalCost;
      updates.commission = finalCost * 0.1;
    }
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    await booking.update(updates);

    // Update provider stats if completed
    if (status === 'completed') {
      await ProviderProfile.increment('completedBookings', {
        by: 1,
        where: { id: booking.providerId },
      });
      
      // Notify customer that booking is completed
      await NotificationController.createNotification(
        booking.customerId,
        'booking',
        'Booking Completed',
        'Your booking has been completed. Please leave a review!',
        booking.id,
        'booking'
      );
    } else if (status === 'accepted') {
      // Notify customer that booking was accepted
      await NotificationController.createNotification(
        booking.customerId,
        'booking',
        'Booking Accepted',
        'Your booking request has been accepted by the provider',
        booking.id,
        'booking'
      );
    } else if (status === 'cancelled') {
      // Notify both parties about cancellation
      const notifyUserId = req.user.role === 'provider' ? booking.customerId : booking.providerId;
      await NotificationController.createNotification(
        notifyUserId,
        'booking',
        'Booking Cancelled',
        `A booking has been cancelled${cancellationReason ? ': ' + cancellationReason : ''}`,
        booking.id,
        'booking'
      );
    }

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['firstName', 'lastName', 'phone', 'email', 'avatar'],
        },
        {
          model: ProviderProfile,
          as: 'provider',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'phone', 'avatar'],
            },
          ],
        },
        {
          model: ServiceCategory,
          as: 'serviceCategory',
        },
      ],
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

// Request additional payment (Provider only)
export const requestAdditionalPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { amount, reason, description } = req.body;

    // Verify provider owns this booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const provider = await ProviderProfile.findOne({ where: { userId: req.user.id } });
    if (!provider || booking.providerId !== provider.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Check if booking can have adjustments
    if (!['accepted', 'confirmed', 'in-progress'].includes(booking.status)) {
      res.status(400).json({ message: 'Cannot request payment for this booking status' });
      return;
    }

    try {
      // Create payment adjustment request
      const adjustment = await PaymentAdjustment.create({
        bookingId: parseInt(bookingId),
        requestedBy: req.user.id,
        amount,
        reason,
        description,
        status: 'pending',
      });

      // Notify customer about payment request
      await NotificationController.createNotification(
        booking.customerId,
        'payment',
        'Additional Payment Requested',
        `Provider requested $${amount} additional payment: ${reason}`,
        booking.id,
        'payment-adjustment'
      );

      res.status(201).json({
        message: 'Payment request sent to customer',
        adjustment,
      });
    } catch (dbError: any) {
      // If table doesn't exist, inform user
      if (dbError.message && dbError.message.includes('does not exist')) {
        res.status(503).json({ 
          message: 'Payment adjustment feature is being set up. Please try again in a few moments.' 
        });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Request payment error:', error);
    res.status(500).json({ message: 'Error requesting additional payment' });
  }
};

// Respond to payment adjustment (Customer only)
export const respondToPaymentRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adjustmentId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const adjustment = await PaymentAdjustment.findByPk(adjustmentId, {
      include: [{
        model: Booking,
        as: 'booking',
      }],
    });

    if (!adjustment) {
      res.status(404).json({ message: 'Payment request not found' });
      return;
    }

    const booking = (adjustment as any).booking;
    if (booking.customerId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (adjustment.status !== 'pending') {
      res.status(400).json({ message: 'This request has already been processed' });
      return;
    }

    if (action === 'approve') {
      // Update adjustment status
      await adjustment.update({
        status: 'approved',
        respondedAt: new Date(),
      });

      // Update booking with new amount
      const newTotal = (booking.estimatedCost || 0) + adjustment.amount;
      await booking.update({
        estimatedCost: newTotal,
        commission: newTotal * 0.08, // 8% commission
      });

      // Notify provider about approval
      await NotificationController.createNotification(
        adjustment.requestedBy,
        'payment',
        'Payment Request Approved',
        `Customer approved your $${adjustment.amount} payment request`,
        booking.id,
        'payment-adjustment'
      );

      res.json({
        message: 'Payment request approved. Please proceed with payment.',
        adjustment,
        newTotal,
      });
    } else if (action === 'reject') {
      await adjustment.update({
        status: 'rejected',
        respondedAt: new Date(),
      });

      // Notify provider about rejection
      await NotificationController.createNotification(
        adjustment.requestedBy,
        'payment',
        'Payment Request Rejected',
        `Customer rejected your $${adjustment.amount} payment request`,
        booking.id,
        'payment-adjustment'
      );

      res.json({
        message: 'Payment request rejected',
        adjustment,
      });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }
  } catch (error) {
    console.error('Respond to payment error:', error);
    res.status(500).json({ message: 'Error processing payment request' });
  }
};

// Get payment adjustments for a booking
export const getPaymentAdjustments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Verify user is either customer or provider of this booking
    const provider = await ProviderProfile.findOne({ where: { userId: req.user.id } });
    const isCustomer = booking.customerId === req.user.id;
    const isProvider = provider && booking.providerId === provider.id;

    if (!isCustomer && !isProvider) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    try {
      const adjustments = await PaymentAdjustment.findAll({
        where: { bookingId },
        include: [{
          model: User,
          as: 'requester',
          attributes: ['firstName', 'lastName'],
        }],
        order: [['createdAt', 'DESC']],
      });

      res.json({ adjustments });
    } catch (dbError: any) {
      // If table doesn't exist yet, return empty array
      if (dbError.message && dbError.message.includes('does not exist')) {
        res.json({ adjustments: [] });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Get adjustments error:', error);
    res.status(500).json({ message: 'Error fetching payment adjustments' });
  }
};

