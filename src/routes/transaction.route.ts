import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transaction.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", transactionController.getAll);
router.get("/summary", transactionController.getSummary);
router.get("/:id", transactionController.getById);
router.post("/", validate(createTransactionSchema), transactionController.create);
router.put("/:id", validate(updateTransactionSchema), transactionController.update);
router.delete("/:id", transactionController.remove);

export default router;
