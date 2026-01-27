import type { Request, RequestHandler, Response } from "express";
import type { IAuthController } from "./interfaces/auth.controller.interface.js";
import type { IAuthService } from "../services/interfaces/auth.service.interface.js";
import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs"
import { ApiResponse } from "../utils/apiResponse.js";
import type { SignupInitiateDTO } from "../dtos/signup.dto.js";
import { ApiError } from "../utils/apiError.js";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";


export class AuthController implements IAuthController {
  constructor(private authService: IAuthService = new AuthService()) {

  }
  signupInitiate = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {

    const signupData: SignupInitiateDTO = req.body;
    const avatarLocalPath = req.file?.path;

    try {
      await this.authService.signupInitiate(signupData, avatarLocalPath);

      return res
        .status(201)
        .json(
          new ApiResponse(200, null, "verification code sent to email")
        );

    } catch (error) {

      
      if (avatarLocalPath) {
        try {
          await fs.promises.unlink(avatarLocalPath);
        } catch {}
      }

      throw error;
    }
  }
);

  signupVerifyCode = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        throw new ApiError(400, "Email and verification code are required");
      }

      const result = await this.authService.signupVerifyCode(email, otp);


      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/'
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/'
      });

      const { accessToken, refreshToken, ...userData } = result;


      return res.status(200).json(
        new ApiResponse(
          200,
          userData,
          "User registered successfully"
        )
      );
    }
  );
  login = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const user = await this.authService.login(req.body);
      const { accessToken, refreshToken, ...userData } = user;
      res.cookie("accessToken", user.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        // secure: false,
        // sameSite: "lax",
        path: '/'
      });

      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/'
      });
      console.log(user);
      
      return res.status(200).json(
        new ApiResponse(200, userData, "Login successful")
      );
    }
  )
  checkUsernameAvailability = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const { username } = req.params;
      if (!username || username.trim() === "" || username === undefined) {
        throw new ApiError(400, "Username is required");
      }
      const isAvailable = await this.authService.isUsernameAvailable(username?.toLowerCase());
      return res.status(200).json(
        new ApiResponse(200, { isAvailable }, "Username availability checked")
      );
    }
  )
  updateUsername = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const userId = req.user?._id;
      const { username } = req.body;

      if (!username || username.trim() === "" || username === undefined) {
        throw new ApiError(400, "Username is required");
      }
      const isAvailable = await this.authService.isUsernameAvailable(username?.toLowerCase());
      if (!isAvailable) {
        throw new ApiError(409, "Username is already taken");
      }

      const updatedUsername = await this.authService.updateUsername(userId, username?.toLowerCase());

      return res.status(200).json(
        new ApiResponse(200, { username: updatedUsername }, "Username updated successfully")
      )
    }
  )
  updateAvatar = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {

    const userId = req.user?._id;
    const avatarLocalPath: string | undefined = req.file?.path;

    try {
      if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
      }

      const updatedAvatarUrl: string | undefined =
        await this.authService.updateAvatar(userId, avatarLocalPath);

      if (!updatedAvatarUrl) {
        throw new ApiError(500, "Failed to update avatar");
      }

      return res.status(200).json(
        new ApiResponse(
          200,
          { avatarUrl: updatedAvatarUrl },
          "Avatar updated successfully"
        )
      );

    } catch (error) {

      
      if (avatarLocalPath) {
        try {
          await fs.promises.unlink(avatarLocalPath);
        } catch {}
      }

      throw error;
    }
  }
);

  updatePassword = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const username = req.user?.username;
      const userId = req.user?._id;
      const { currentPassword, newPassword } = req.body; 
      if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
      }
      const updatedPassword = await this.authService.updatePassword(username, userId, currentPassword, newPassword);
      if(updatedPassword===undefined){
        throw new ApiError(500, "Failed to update password");
      }
      return res.status(200).json(
        new ApiResponse(200, null, "Password updated successfully")
      )
    } 
  )
  getUserInBulk = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const userIds: string[]= req.body.userIds; 
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "User IDs array is required");
      }
      const users = await this.authService.getUserInBulk(userIds);  
      return res.status(200).json(
        new ApiResponse(200, { users }, "Users fetched successfully")
      )
    } 
  )
  getUserInfoByUsername = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      const {username}= req.body; 
      console.log(username);
      
      if(!username){
        throw new ApiError(400,"username cannot be undefined")
      }
      const user = await this.authService.getUserInfoByUsername(username);  
      console.log(user);
      
      return res.status(200).json(
        new ApiResponse(200,  user , "Users fetched successfully")
      )
    } 
  )
  getUserNames = asyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
      console.log("the data ",req.body);
      
      const {prefix}= req.body; 
      
      
      if(!prefix){
        throw new ApiError(400,"prefix cannot be undefined")
      }
      const usernames = await this.authService.getUserNames(prefix);  
      console.log("usernames",usernames);
      
      
      return res.status(200).json(
        new ApiResponse(200,  usernames , "Usernames fetched successfully")
      )
    } 
  )
  refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is missing");
    }

    const result = await this.authService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Access token refreshed successfully")
    );
  }
);

}

