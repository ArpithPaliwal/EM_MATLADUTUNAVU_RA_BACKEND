import axios from "axios";
import type { UserBulkResponse, UserDetailsSummaryDTO } from "../dtos/userDetailsSummary.dto.js";
import { ApiError } from "../utils/apiError.js";
export class UserClient {
    
    
    async getUserInfoClient(userIds?: string[]): Promise<UserBulkResponse> {
        try {
            const response = await axios.post(`http://localhost:8000/api/v1/users/getUserInBulk`, { userIds }); 
            
            
            return response.data.data;
        } catch (error) {
            console.error("Error checking user existence:", error);
            throw new Error("Failed to check user existence");
        }
    }
    // async getUserInfoByUsername(username:string): Promise<UserDetailsSummaryDTO> {
    //     try {
    //         const response = await axios.post(`http://localhost:8000/api/v1/users/getUserInfoByUsername`, {username}); 
            
    //         console.log("the data",response.data.data);
            
    //         return response.data.data;
    //     } catch (error) {
    //         console.error("Error checking user existence:", error);
    //         throw new Error("Failed to check user existence");
    //     }
    // }
    async getUserInfoByUsername(username: string): Promise<any> {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/v1/users/getUserInfoByUsername",
      { username }
    );

    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new ApiError(
        error.response.status,
        error.response.data.message
      );
    }

    throw new ApiError(500, "User service unreachable");
  }
}

}
