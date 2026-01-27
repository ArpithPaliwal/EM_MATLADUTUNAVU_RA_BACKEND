import type { RequestHandler } from "express";

export interface IAuthController {
  signupInitiate: RequestHandler;
  signupVerifyCode: RequestHandler;
  login: RequestHandler;
  checkUsernameAvailability: RequestHandler;
  updateUsername: RequestHandler;
  updateAvatar: RequestHandler;
  updatePassword: RequestHandler;
  getUserInBulk: RequestHandler;
  getUserInfoByUsername:RequestHandler;
  getUserNames:RequestHandler;
  refreshToken:RequestHandler;
  
}
