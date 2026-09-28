import { Router } from 'express';
import { list, getOne, create, update } from '../controllers/productController.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productCreateSchema, productUpdateSchema } from '../middleware/schemas.js';

const router = Router();

router.get('/', optionalAuth, list);
router.get('/:id', optionalAuth, getOne);
router.post('/', requireAdmin, validate(productCreateSchema), create);
router.patch('/:id', requireAdmin, validate(productUpdateSchema), update);

export default router;
