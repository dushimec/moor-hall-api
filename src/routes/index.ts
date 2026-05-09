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
import serviceItemRoutes from './serviceItem.routes';
import contentRoutes from './content.routes';
import settingsRoutes from './settings.routes';
import reportRoutes from './report.routes';
import reservationRoutes from './reservation.routes';
// import cateringRoutes from './catering.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/activities', activityRoutes);
router.use('/admin/notifications', notificationRoutes);
router.use('/orders', orderRoutes);
router.use('/admin/categories', categoryRoutes);
router.use('/admin/menu-items', menuItemRoutes);
router.use('/admin/customers', customerRoutes);
router.use('/admin/service-items', serviceItemRoutes);
router.use('/admin/content', contentRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/reports', reportRoutes);
router.use('/admin/reservations', reservationRoutes);
// router.use('/admin/catering', cateringRoutes);
router.use('/admin/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
