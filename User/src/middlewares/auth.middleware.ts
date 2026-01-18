import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
export const verifyJWT = asyncHandler(
  async (req, _, next): Promise<void> => {
    try {
      const accessToken = req.cookies?.accessToken;
        if (!accessToken) { 
            throw new ApiError(401, "Access token is missing");
        }   
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }       
});