import { Router } from 'express';
import { usersController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

router.get('/', authMiddleware, usersController.getAll);
router.get('/:id', authMiddleware, usersController.getById);
router.post('/', validate(createUserSchema), usersController.create);
router.put('/:id', authMiddleware, validate(updateUserSchema), usersController.update);
router.delete('/:id', authMiddleware, usersController.remove);

export default router;