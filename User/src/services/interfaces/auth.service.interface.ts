import type { LoginDTO } from "../../dtos/login.dto.js";
import type { SignupInitiateDTO } from "../../dtos/signup.dto.js";
import type { SignupResponseDTO } from "../../dtos/signupResponse.dto.js";
import type { UserDetailsSummaryDTO } from "../../dtos/userDetailsSummary.dto.js";

export interface IAuthService {
    signupInitiate(data:SignupInitiateDTO,avatarLocalPath?: string):Promise<any>;
    signupVerifyCode(email:string,code:string):Promise<any>;
    login(data: LoginDTO): Promise<SignupResponseDTO>;
    isUsernameAvailable(username: string): Promise<boolean>;
    updateUsername(userId: string, newUsername: string): Promise<string>;
    updateAvatar(userId: string, avatarLocalPath: string): Promise<string>;
    updatePassword(username: SignupInitiateDTO, userId: string, currentPassword: string, newPassword: string): Promise<void>;
    getUserInBulk(userIds: string[]): Promise<UserDetailsSummaryDTO[]>;
    getUserInfoByUsername(username:string):Promise<UserDetailsSummaryDTO>;
    getUserNames(prefix:string):Promise<string[]>;
    
}

