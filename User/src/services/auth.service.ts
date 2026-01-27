
import { AuthRepository } from "../repositories/auth.repository.js";
import type { IAuthRepository } from "../repositories/interfaces/auth.repository.interface.js";
import { ApiError } from "../utils/apiError.js";
import type { IAuthService } from "./interfaces/auth.service.interface.js";
import path from "path";
import fs from "fs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { comparePassword, hashPassword } from "../utils/password.utils.js";
import type { SignupInitiateDTO } from "../dtos/signup.dto.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { RedisService } from "../redis/redis.service.js";
import { sendMail } from "../rabbitmq/producer.mail.rabbitmqq.js";
import type { SignupResponseDTO } from "../dtos/signupResponse.dto.js";
import type { SignupOtpTempData } from "../dtos/signupOtpTempData.dto.js";
import { Types } from "mongoose";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils.js";
import type { LoginDTO } from "../dtos/login.dto.js";
import { rateLimit } from "../redis/redisRateLimit.service.js";
import type { UserDetailsSummaryDTO } from "../dtos/userDetailsSummary.dto.js";
import { redisClient } from "../redis/index.js";
import jwt from "jsonwebtoken";
import  {User}   from "../models/user.model.js";

const tempFolder = path.resolve("public", "temp");
export class AuthService implements IAuthService {

    //   private authRepository: IAuthRepository;

    //   constructor() {
    //     this.authRepository = new AuthRepository();
    //   }
    constructor(private authrepository: IAuthRepository = new AuthRepository(),
        private redisService: RedisService = new RedisService()) {

    }

    async signupInitiate(data: SignupInitiateDTO, avatarLocalPath: string) {
        const { username, email, password } = data;
        if (
            [email, username, password].some(
                (field) => field?.trim() == ''
            )
        ) {
            throw new ApiError(400, 'All fields are required');
        }

        const existedUser: Boolean = await this.authrepository.findUser(data)
        if (existedUser) {
            try {
                if (fs.existsSync(tempFolder)) {
                    const files = fs.readdirSync(tempFolder);
                    files.forEach((file) => {
                        const filePath = path.join(tempFolder, file);
                        fs.unlinkSync(filePath);
                        console.log('Deleted file:', filePath);
                    });
                    console.log('All files in temp folder deleted.');
                }
            } catch (error) {
                console.error('Error deleting files in temp folder:', error);
            }
            throw new ApiError(
                409,
                'User with this email or username already exists'
            );
        }
        await rateLimit({
            key: `rate_limit:otp:${email}`,
            limit: 5,
            windowInSeconds: 10 * 60, // 10 minutes
        });

        const verificationCode = generateVerificationCode();

        await this.redisService.set(
            `signup:${data.email}`,
            {
                data,
                avatarLocalPath,
                verificationCode,
            },
            300 // 5 min TTL
        );

        await sendMail({
            to: data.email,
            subject: "Your OTP Code",
            body: `Your OTP is ${verificationCode}. It expires in 5 minutes.`,
        });


    }
    async signupVerifyCode(email: string, code: string): Promise<SignupResponseDTO> {

        const tempData = await this.redisService.get<SignupOtpTempData>(`signup:${email}`);
        if (!tempData) {
            throw new ApiError(400, 'verification Code expired or invalid');
        }
        if (tempData.verificationCode !== code) {
            throw new ApiError(400, 'Invalid verification code');
        }
        const avatarLocalPath = tempData.avatarLocalPath;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        console.log('Uploading to Cloudinary:', avatarLocalPath);
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar || avatar == undefined) {
            throw new ApiError(400, 'Avatar files is required');
        } else {
            console.log('Cloudinary response:', avatar);
        }

        const hashedPassword = await hashPassword(tempData.data.password)
        const userId = new Types.ObjectId();

        const refreshToken = generateRefreshToken(
            userId.toString(),
        );

        const user = await this.authrepository.createUser({ ...tempData.data, password: hashedPassword }, avatar?.secure_url, refreshToken);
        try {
            if (fs.existsSync(avatarLocalPath)) {
                fs.unlinkSync(avatarLocalPath);
            }
        } catch (unlinkErr) {
            console.warn("Failed to delete local temp file:", unlinkErr);
        }
        const createdUser = await this.authrepository.findUserById(user._id);

        if (!createdUser) {
            throw new ApiError(
                500,
                'Something went wrong while registering the user'
            );
        }
        const accessToken = generateAccessToken({
            _id: userId.toString(),
            email: createdUser.email,
            username: createdUser.username,
        });

        await this.redisService.del(`signup:${email}`);

        return {
            _id: createdUser._id.toString(),
            username: createdUser.username,
            email: createdUser.email,
            avatar: createdUser.avatar,
            accessToken,
            refreshToken,
        };

    }
    async login(data: LoginDTO): Promise<SignupResponseDTO> {
        const { username, password } = data;
        if (!username || !password) {
            throw new ApiError(400, "Username and password are required");
        }
        const user = await this.authrepository.findUser({ username: username } as SignupInitiateDTO);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (!comparePassword(password, user.password)) {
            throw new ApiError(400, "Invalid password");
        }
        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            email: user.email,
            username: user.username,
        });
        const refreshToken = generateRefreshToken(user._id.toString());

        return {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            accessToken,
            refreshToken,
        };
    }
    async isUsernameAvailable(username: string): Promise<boolean> {
        const user = await this.authrepository.findUser({ username } as SignupInitiateDTO);
        return !user;
    }
    async updateUsername(userId: string, newUsername: string): Promise<string> {
        const user = await this.authrepository.findUserById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const userWithUpdateUsername = await this.authrepository.updateUsername(userId, newUsername);
        if (!userWithUpdateUsername) {
            throw new ApiError(500, "Failed to update username");
        }
        return userWithUpdateUsername.username;
    }
    async updateAvatar(userId: string, avatarLocalPath: string): Promise<string> {
        const user = await this.authrepository.findUserById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        console.log('Uploading to Cloudinary:', avatarLocalPath);
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar || avatar == undefined) {
            throw new ApiError(400, 'Avatar files is required');
        } else {
            console.log('Cloudinary response:', avatar);
        }

        const userWithUpdatedAvatar = await this.authrepository.updateAvatar(userId, avatar?.secure_url);
        if (!userWithUpdatedAvatar) {
            throw new ApiError(500, "Failed to update avatar");
        }

        try {
            if (fs.existsSync(avatarLocalPath)) {
                fs.unlinkSync(avatarLocalPath);
            }
        } catch (unlinkErr) {
            console.warn("Failed to delete local temp file:", unlinkErr);
        }

        return userWithUpdatedAvatar.avatar;
    }
    async updatePassword(username: SignupInitiateDTO, userId: string, currentPassword: string, newPassword: string): Promise<void> {

        const user = await this.authrepository.findUser(username as SignupInitiateDTO);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (!comparePassword(currentPassword, user.password)) {
            throw new ApiError(400, "Current password is incorrect");
        }
        const hashedpassword = await hashPassword(newPassword);

        const updatedPassword = await this.authrepository.updatePassword(userId, hashedpassword);
        return updatedPassword;
    }
    async getUserInBulk(userIds: string[]): Promise<UserDetailsSummaryDTO[]> {
        const users = await this.authrepository.getUserInBulk(userIds);
        return users;
    }
    async getUserInfoByUsername(username: string): Promise<UserDetailsSummaryDTO> {
        const user = await this.authrepository.getUserInfoByUsername(username);

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        console.log(user);

        return {
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar,
        };
    }
    async getUserNames(prefix: string): Promise<string[]> {
        console.log("here",prefix);
        
        const redisKey = "usernames:index";

        const safePrefix = prefix.trim().toLowerCase();

        if (!safePrefix) return [];

        const min = `[${safePrefix}`;
        const max = `[${safePrefix}\xff`;

        const cached = await redisClient.zRangeByLex(redisKey, min, max, {
            LIMIT: { offset: 0, count: 10 },
        });

        console.log("cache service", cached);

        if (cached.length > 0) return cached;

        const users = await this.authrepository.getUserNames(prefix);

        for (const u of users) {
            await redisClient.zAdd(redisKey, {
                score: 0,
                value: u.username.toLowerCase(),
            });
        }

        console.log("usernames service", users);

        return users.map((u: any) => u.username);
    }


    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as { userId: string };

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );

      return { accessToken };

    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }
    
}