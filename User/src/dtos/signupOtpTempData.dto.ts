import type { SignupInitiateDTO } from "./signup.dto.js";

export type SignupOtpTempData = {
  data: SignupInitiateDTO;
  avatarLocalPath?: string | undefined;
  verificationCode: string;
  attempts: number;
};
