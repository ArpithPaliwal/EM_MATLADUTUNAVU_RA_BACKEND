import type { RequestHandler ,Request ,Response,NextFunction} from "express";

// export const asyncHandler =
//   (handler: RequestHandler): RequestHandler =>{
//     return async(req:Request, res:Response, next:NextFunction) => {
//     Promise.resolve(handler(req, res, next)).catch(next);
//   }};
export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };