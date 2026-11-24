import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { HttpError } from "../util/httpError"
import errors from "../util/errorsContants"
import { env } from "../config/env"

export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, errors.AUTH.TOKEN_REQUIRED))
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string
      email: string
      role: string
    }

    req.user = decoded
    next()
  } catch {
    return next(new HttpError(401, errors.AUTH.INVALID_TOKEN))
  }
}
