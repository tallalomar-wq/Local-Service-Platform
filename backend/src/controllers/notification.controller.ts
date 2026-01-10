import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Notification from '../models/Notification.model';

export class NotificationController {
  // Get all notifications for current user
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const { unreadOnly } = req.query;
      const userId = req.user.id;

      const where: any = { userId };
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const notifications = await Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      const unreadCount = await Notification.count({
        where: { userId, isRead: false },
      });

      res.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  }

  // Mark notification as read
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      await notification.update({ isRead: true });

      res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ message: 'Failed to mark all as read' });
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id, userId },
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      await notification.destroy();

      res.json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  }

  // Helper method to create notifications (used by other controllers)
  static async createNotification(
    userId: number,
    type: 'booking' | 'payment' | 'review' | 'subscription' | 'general',
    title: string,
    message: string,
    relatedId?: number,
    relatedType?: string
  ) {
    try {
      await Notification.create({
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        isRead: false,
      });
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }
}
