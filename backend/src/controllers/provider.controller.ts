import { Request, Response } from 'express';
import { ProviderProfile, ServiceCategory, User, Review, SubscriptionPlan } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';

export const getAllProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, city, state, minRating, user } = req.query;

    const whereClause: any = {};

    // If filtering by specific user, return their profile regardless of status
    if (user) {
      whereClause.userId = user;
    } else {
      // Show active and trial subscriptions (for testing)
      whereClause.subscriptionStatus = { [Op.in]: ['active', 'trial'] };
      // For development, show all providers (remove verification requirement)
      // whereClause.isVerified = true;
    }

    if (category) {
      whereClause.serviceCategoryId = category;
    }
    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }
    if (state) {
      whereClause.state = state;
    }
    if (minRating) {
      whereClause.rating = { [Op.gte]: parseFloat(minRating as string) };
    }

    const providers = await ProviderProfile.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: ServiceCategory,
          as: 'serviceCategory',
          attributes: ['id', 'name', 'icon'],
        },
        {
          model: SubscriptionPlan,
          as: 'subscriptionPlan',
          attributes: ['id', 'name', 'price', 'interval', 'features', 'commissionRate'],
        },
      ],
      order: [['rating', 'DESC']],
    });

    res.json({ providers, count: providers.length });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Error fetching providers' });
  }
};

export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const provider = await ProviderProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar'],
        },
        {
          model: ServiceCategory,
          as: 'serviceCategory',
          attributes: ['id', 'name', 'description', 'icon'],
        },
        {
          model: SubscriptionPlan,
          as: 'subscriptionPlan',
          attributes: ['id', 'name', 'price', 'interval', 'features', 'commissionRate'],
        },
        {
          model: Review,
          as: 'reviewsReceived',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['firstName', 'lastName', 'avatar'],
            },
          ],
          limit: 10,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!provider) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }

    res.json({ provider });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ message: 'Error fetching provider' });
  }
};

export const createProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      businessName,
      bio,
      serviceCategoryId,
      address,
      city,
      state,
      zipCode,
      hourlyRate,
      yearsOfExperience,
      certifications,
      insurance,
      availableHours,
    } = req.body;

    const existingProvider = await ProviderProfile.findOne({ where: { userId: req.user.id } });
    if (existingProvider) {
      res.status(400).json({ message: 'Provider profile already exists' });
      return;
    }

    const provider = await ProviderProfile.create({
      userId: req.user.id,
      businessName,
      bio,
      serviceCategoryId,
      address,
      city,
      state,
      zipCode,
      hourlyRate,
      yearsOfExperience,
      certifications,
      insurance,
      availableHours,
      subscriptionStatus: 'trial',
      totalReviews: 0,
      completedBookings: 0,
      isVerified: false,
    });

    // Update user role to provider
    await User.update({ role: 'provider' }, { where: { id: req.user.id } });

    res.status(201).json({
      message: 'Provider profile created successfully',
      provider,
    });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ message: 'Error creating provider profile' });
  }
};

export const updateProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const provider = await ProviderProfile.findOne({ where: { userId: req.user.id } });

    if (!provider) {
      res.status(404).json({ message: 'Provider profile not found' });
      return;
    }

    await provider.update(req.body);

    res.json({
      message: 'Provider profile updated successfully',
      provider,
    });
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ message: 'Error updating provider profile' });
  }
};

export const getMyProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const provider = await ProviderProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: ServiceCategory,
          as: 'serviceCategory',
        },
      ],
    });

    if (!provider) {
      res.status(404).json({ message: 'Provider profile not found' });
      return;
    }

    res.json({ provider });
  } catch (error) {
    console.error('Get my provider profile error:', error);
    res.status(500).json({ message: 'Error fetching provider profile' });
  }
};
