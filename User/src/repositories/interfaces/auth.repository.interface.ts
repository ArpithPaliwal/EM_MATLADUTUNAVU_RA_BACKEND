import type { SignupInitiateDTO } from "../../dtos/signup.dto.js";
import type { UserDetailsSummaryDTO } from "../../dtos/userDetailsSummary.dto.js";


export interface IAuthRepository {

    createUser(data:SignupInitiateDTO,avatar:string,refreshToken:string):Promise<any>;
    findUser(data:SignupInitiateDTO):Promise<any>;
    findUserById(id:string):Promise<any>;
    updateUsername(userId: string, newUsername: string): Promise<any>;
    updateAvatar(userId: string, avatarLocalPath: string): Promise<any>;
    updatePassword(userId: string, hashedPassword: string): Promise<any>;
    getUserInBulk(userIds: string[]): Promise<any[]>;
    getUserInfoByUsername(username: string): Promise<any>;
    getUserNames(prefix:string):Promise<any>;
}