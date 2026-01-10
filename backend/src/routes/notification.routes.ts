import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, NotificationController.getNotifications);
router.put('/:id/read', authenticate, NotificationController.markAsRead);
router.put('/mark-all-read', authenticate, NotificationController.markAllAsRead);
router.delete('/:id', authenticate, NotificationController.deleteNotification);

export default router;
