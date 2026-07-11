import type {
  Request,
  Response,
  RequestHandler,
  NextFunction
} from 'express'

type asyncController = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>

export const asyncHandler = (controller: asyncController):RequestHandler =>{
  return (req,res,next)=> 
    Promise.resolve(controller(req,res,next)).catch(next)
}