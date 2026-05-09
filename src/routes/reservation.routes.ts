import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', reservationController.getReservations);
router.get('/:id', reservationController.getReservationById);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.post('/', reservationController.createReservation);
router.delete('/:id', reservationController.deleteReservation);

export default router;
