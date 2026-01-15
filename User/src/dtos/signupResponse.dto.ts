export interface SignupResponseDTO {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
}

