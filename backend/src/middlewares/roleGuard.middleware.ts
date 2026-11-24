import { NextFunction, Response } from "express"
import { HttpError } from "../util/httpError"
import { AuthRequest } from "./auth.middleware"
import errors from "../util/errorsContants"

export const roleGuard = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, errors.AUTH.UNAUTHORIZED))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, errors.AUTH.FORBIDDEN_ROLE))
    }

    next()
  }
}
