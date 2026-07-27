import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(message: string, data: T): ApiResponse<T> {
  return { success: true, message, data };
}

export function errorResponse(message: string): ApiResponse<null> {
  return { success: false, message, data: null };
}

export function sendSuccess<T>(res: Response, message: string, data: T, statusCode = 200): void {
  res.status(statusCode).json(successResponse(message, data));
}

export function sendError(res: Response, message: string, statusCode = 500): void {
  res.status(statusCode).json(errorResponse(message));
}

export function sendSuccessPaginated<T>(
  res: Response,
  message: string,
  data: T,
  pagination: PaginationInfo,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data: { items: data, pagination },
  });
}

export function handleControllerError(res: Response, error: unknown, defaultMessage: string): void {
  const err = error as { status?: number; message?: string } | null;
  if (err?.status && err?.message) {
    sendError(res, err.message, err.status);
  } else {
    sendError(res, defaultMessage, 500);
  }
}
