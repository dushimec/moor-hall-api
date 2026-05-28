import { Router } from 'express';
import * as menuItemController from '../controllers/menuItem.controller';

const router = Router();

// Public endpoints — no auth required
router.get('/', menuItemController.getPublicMenuItems);
router.get('/:id', menuItemController.getPublicMenuItemById);

export default router;
