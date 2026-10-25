import { Router } from 'express';
import { create, list, getOne, updateStatus, cancelOwn } from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderCreateSchema, orderStatusSchema } from '../middleware/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(orderCreateSchema), create);
router.get('/', list);
router.get('/:id', getOne);
// Customers cancel their own order while it is still "placed".
router.post('/:id/cancel', cancelOwn);
router.patch('/:id/status', requireAdmin, validate(orderStatusSchema), updateStatus);

export default router;
