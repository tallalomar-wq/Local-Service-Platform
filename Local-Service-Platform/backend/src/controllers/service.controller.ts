import { Request, Response } from 'express';
import { ServiceCategory } from '../models';

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await ServiceCategory.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    res.json({ services, count: services.length });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await ServiceCategory.findByPk(id);

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
};
