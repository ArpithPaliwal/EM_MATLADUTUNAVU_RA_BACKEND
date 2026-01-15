import { log } from "console";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';


export const verifyJWT = asyncHandler(
  async (req, _, next): Promise<void> => {
    // console.log("COOKIE accessToken:", req.cookies?.accessToken?.slice(0, 25));
    // console.log("VERIFY secret:", process.env.ACCESS_TOKEN_SECRET);
    try {
      const accessToken = req.cookies?.accessToken;
      if (!accessToken) {
        throw new ApiError(401, "Access token is missing");
      }
      console.log("VERIFY secret:", process.env.ACCESS_TOKEN_SECRET);
      console.log("Token received:", accessToken?.slice(0, 20));
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) ;
      req.user = decoded;
      console.log("Decoded JWT payload:", decoded);
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token");
    }
  });