import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { sendError } from '../shared/utils/response'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      const firstError = Object.values(errors).flat()[0] as string | undefined
      sendError(res, firstError || 'Validation failed', 422, errors)
      return
    }
    req.body = result.data
    next()
  }
}
