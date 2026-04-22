import { Router } from 'express';
import * as menuItemController from '../controllers/menuItem.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', menuItemController.createMenuItem);
router.get('/', menuItemController.getMenuItems);
router.get('/:id', menuItemController.getMenuItemById);
router.patch('/:id', menuItemController.updateMenuItem);
router.patch('/:id/availability', menuItemController.toggleAvailability);
router.delete('/:id', menuItemController.deleteMenuItem);

export default router;
