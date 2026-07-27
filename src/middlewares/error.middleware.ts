import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/api-response";

export const errorMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("Error no manejado:", error);
  if (error?.status) {
    res.status(error.status).json(errorResponse(error.message));
    return;
  }
  res.status(500).json(errorResponse("Error interno del servidor"));
};
