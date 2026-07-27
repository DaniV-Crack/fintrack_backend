import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createBudgetSchema,
  updateBudgetSchema,
} from "../schemas/budget.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", budgetController.getAll);
router.get("/:id", budgetController.getById);
router.get("/:id/progress", budgetController.getProgress);
router.post("/", validate(createBudgetSchema), budgetController.create);
router.put("/:id", validate(updateBudgetSchema), budgetController.update);
router.delete("/:id", budgetController.remove);

export default router;
