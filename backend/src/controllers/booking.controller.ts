import { Request, Response } from 'express';
import { Booking, ProviderProfile, User, ServiceCategory, PaymentAdjustment } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';
import { NotificationController } from './notification.controller';
import { sendBookingNotificationEmail } from '../services/email.service';
import { sendBookingNotification } from '../services/sms.service';

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

    // Get provider and service details for notifications
    const providerWithUser = await ProviderProfile.findByPk(providerId, {
      include: [{ model: User, as: 'user' }],
    });
    const serviceCategory = await ServiceCategory.findByPk(serviceCategoryId);

    // Send notification to provider (use userId, not providerId)
    const providerUserId = providerWithUser ? (providerWithUser as any).userId : null;
    if (providerUserId) {
      await NotificationController.createNotification(
        providerUserId,
        'booking',
        'New Booking Request',
        `You have a new booking request for ${serviceDate} at ${serviceTime}`,
        booking.id,
        'booking'
      );
    }

    // Send email and SMS notifications to provider
    if (providerWithUser && serviceCategory) {
      const providerUser = (providerWithUser as any).user;
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
      
      // Send email
      await sendBookingNotificationEmail(
        providerUser.email,
        providerUser.firstName,
        'New Booking Request',
        `You have received a new booking request from ${req.user.firstName} ${req.user.lastName}.`,
        {
          serviceDate,
          serviceTime,
          serviceName: serviceCategory.name,
          address: fullAddress,
        }
      );

      // Send SMS if provider has phone and it's verified
      if (providerUser.phone && providerUser.phoneVerified) {
        await sendBookingNotification(
          providerUser.phone,
          `ServiceHub: New booking request for ${serviceCategory.name} on ${serviceDate} at ${serviceTime}. Check your dashboard to respond.`
        );
      }
    }

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

    // Get booking details for notifications
    const bookingWithDetails = await Booking.findByPk(id, {
      include: [
        { model: User, as: 'customer' },
        { 
          model: ProviderProfile, 
          as: 'provider',
          include: [{ model: User, as: 'user' }],
        },
        { model: ServiceCategory, as: 'serviceCategory' },
      ],
    });

    if (!bookingWithDetails) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const customer = (bookingWithDetails as any).customer;
    const provider = (bookingWithDetails as any).provider;
    const providerUser = provider?.user;
    const serviceCategory = (bookingWithDetails as any).serviceCategory;
    const fullAddress = `${bookingWithDetails.address}, ${bookingWithDetails.city}, ${bookingWithDetails.state} ${bookingWithDetails.zipCode}`;

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

      // Send email and SMS to customer
      if (customer && serviceCategory) {
        await sendBookingNotificationEmail(
          customer.email,
          customer.firstName,
          'Booking Completed',
          `Your booking with ${providerUser?.firstName || 'the provider'} has been completed. We hope you had a great experience!`,
          {
            serviceDate: bookingWithDetails.serviceDate.toString(),
            serviceTime: bookingWithDetails.serviceTime,
            serviceName: serviceCategory.name,
            address: fullAddress,
          }
        );

        if (customer.phone && customer.phoneVerified) {
          await sendBookingNotification(
            customer.phone,
            `ServiceHub: Your booking for ${serviceCategory.name} has been completed! Please leave a review.`
          );
        }
      }
    } else if (status === 'accepted') {
      // Notify customer that booking was accepted
      console.log('Creating notification for customer:', booking.customerId);
      await NotificationController.createNotification(
        booking.customerId,
        'booking',
        'Booking Accepted',
        'Your booking request has been accepted by the provider',
        booking.id,
        'booking'
      );

      // Send email and SMS to customer
      if (customer && serviceCategory) {
        console.log('Sending email to customer:', customer.email);
        try {
          await sendBookingNotificationEmail(
            customer.email,
            customer.firstName,
            'Booking Accepted',
            `Great news! ${providerUser?.firstName || 'The provider'} has accepted your booking request.`,
            {
              serviceDate: bookingWithDetails.serviceDate.toString(),
              serviceTime: bookingWithDetails.serviceTime,
              serviceName: serviceCategory.name,
              address: fullAddress,
            }
          );
          console.log('Email sent successfully to:', customer.email);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }

        if (customer.phone && customer.phoneVerified) {
          console.log('Sending SMS to customer:', customer.phone);
          try {
            await sendBookingNotification(
              customer.phone,
              `ServiceHub: Your booking for ${serviceCategory.name} on ${bookingWithDetails.serviceDate} has been accepted!`
            );
            console.log('SMS sent successfully to:', customer.phone);
          } catch (smsError) {
            console.error('Error sending SMS:', smsError);
          }
        }
      } else {
        console.error('Missing customer or service category data for notification');
        console.log('Customer:', customer);
        console.log('Service Category:', serviceCategory);
      }
    } else if (status === 'cancelled') {
      // Notify the other party about cancellation
      // If provider cancelled, notify customer. If customer cancelled, notify provider.
      const notifyUserId = req.user.role === 'provider' ? booking.customerId : provider.userId;
      console.log('Creating cancellation notification for user:', notifyUserId, 'Role who cancelled:', req.user.role);
      
      await NotificationController.createNotification(
        notifyUserId,
        'booking',
        'Booking Cancelled',
        `A booking has been cancelled${cancellationReason ? ': ' + cancellationReason : ''}`,
        booking.id,
        'booking'
      );

      // Send email and SMS to the other party
      const notifyUser = req.user.role === 'provider' ? customer : providerUser;
      if (notifyUser && serviceCategory) {
        console.log('Sending cancellation email to:', notifyUser.email);
        try {
          await sendBookingNotificationEmail(
            notifyUser.email,
            notifyUser.firstName,
            'Booking Cancelled',
            `A booking for ${serviceCategory.name} has been cancelled${cancellationReason ? ': ' + cancellationReason : ''}.`,
            {
              serviceDate: bookingWithDetails.serviceDate.toString(),
              serviceTime: bookingWithDetails.serviceTime,
              serviceName: serviceCategory.name,
              address: fullAddress,
            }
          );
          console.log('Cancellation email sent successfully');
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError);
        }

        if (notifyUser.phone && notifyUser.phoneVerified) {
          console.log('Sending cancellation SMS to:', notifyUser.phone);
          try {
            await sendBookingNotification(
              notifyUser.phone,
              `ServiceHub: Your booking for ${serviceCategory.name} on ${bookingWithDetails.serviceDate} has been cancelled.`
            );
            console.log('Cancellation SMS sent successfully');
          } catch (smsError) {
            console.error('Error sending cancellation SMS:', smsError);
          }
        }
      } else {
        console.error('Missing notifyUser or service category for cancellation');
        console.log('notifyUser:', notifyUser);
        console.log('Service Category:', serviceCategory);
      }
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

