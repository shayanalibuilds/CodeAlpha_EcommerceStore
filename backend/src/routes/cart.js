import { Router } from 'express';
import { show, addItem, updateItem, removeItem } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cartAddSchema, cartUpdateSchema } from '../middleware/schemas.js';

const router = Router();

// Every cart route belongs to the signed-in user.
router.use(requireAuth);

router.get('/', show);
router.post('/items', validate(cartAddSchema), addItem);
router.patch('/items/:productId', validate(cartUpdateSchema), updateItem);
router.delete('/items/:productId', removeItem);

export default router;
