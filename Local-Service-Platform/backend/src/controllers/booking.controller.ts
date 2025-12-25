import { Request, Response } from 'express';
import { Booking, ProviderProfile, User, ServiceCategory } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';

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
    if (!provider || provider.subscriptionStatus !== 'active') {
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
