import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", validate(createCategorySchema), categoryController.create);
router.put("/:id", validate(updateCategorySchema), categoryController.update);
router.delete("/:id", categoryController.remove);

export default router;
