import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import activityRoutes from './activity.routes';
import notificationRoutes from './notification.routes';
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menuItem.routes';
import customerRoutes from './customer.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/activities', activityRoutes);
router.use('/admin/notifications', notificationRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/categories', categoryRoutes);
router.use('/admin/menu-items', menuItemRoutes);
router.use('/admin/customers', customerRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
