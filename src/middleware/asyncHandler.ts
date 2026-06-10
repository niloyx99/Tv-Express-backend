import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (handler: AsyncRoute): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};
