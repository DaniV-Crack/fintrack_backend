import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.slice(1).join(".");
        if (!fields[field]) {
          fields[field] = issue.message;
        }
      }
      res.status(400).json({
        success: false,
        message: "Error de validación",
        data: { fields },
      });
      return;
    }
    next();
  };
