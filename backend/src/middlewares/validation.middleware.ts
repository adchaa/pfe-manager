import { ZodType } from "zod"
import errors from "../util/errorsContants"
import { HttpError } from "../util/httpError"
import { NextFunction, Request, Response } from "express"

export function validateRequest(
  schema: ZodType,
  fieldName: "body" | "params" | "query" | "cookies",
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req[fieldName])
      next()
    } catch (error: any) {
      next(new HttpError(400, errors.INVALID_INPUT, error.stack))
    }
  }
}
