import { Request, Response } from 'express';
import { Review, Booking, User, ProviderProfile } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { sequelize } from '../config/database';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.customerId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (booking.status !== 'completed') {
      res.status(400).json({ message: 'Can only review completed bookings' });
      return;
    }

    const existingReview = await Review.findOne({ where: { bookingId } });
    if (existingReview) {
      res.status(400).json({ message: 'Review already exists for this booking' });
      return;
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user.id,
      providerId: booking.providerId,
      rating,
      comment,
      isVerified: true,
    });

    // Update provider rating
    const provider = await ProviderProfile.findByPk(booking.providerId);
    if (provider) {
      const reviews = await Review.findAll({ where: { providerId: provider.id } });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;

      await provider.update({
        rating: avgRating,
        totalReviews: reviews.length,
      });
    }

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const reviews = await Review.findAll({
      where: { providerId: parseInt(providerId) },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['firstName', 'lastName', 'avatar'],
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    const count = await Review.count({ where: { providerId: parseInt(providerId) } });

    res.json({ reviews, count });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

export const addReviewResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    const provider = await ProviderProfile.findOne({ where: { userId: req.user.id } });
    if (!provider || provider.id !== review.providerId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await review.update({
      response,
      responseDate: new Date(),
    });

    res.json({
      message: 'Response added successfully',
      review,
    });
  } catch (error) {
    console.error('Add review response error:', error);
    res.status(500).json({ message: 'Error adding response' });
  }
};
