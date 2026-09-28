import { Router } from 'express';
import { create, list, getOne, updateStatus } from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderCreateSchema, orderStatusSchema } from '../middleware/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(orderCreateSchema), create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/status', requireAdmin, validate(orderStatusSchema), updateStatus);

export default router;
