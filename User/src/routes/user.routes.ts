import  {Router}  from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
const router = Router();
const authController = new AuthController();

router.route("/signupInitialize").post(upload.single("avatar"),authController.signupInitiate);
router.route("/signupVerifyCode").post(authController.signupVerifyCode);
router.route("/login").post(authController.login);
// router.route("/refreshToken").post(authController.refreshToken);
router.route("/checkUsernameAvailability").post(authController.checkUsernameAvailability);
router.route("/updateUsername").put(authController.updateUsername);
router.route("/updateAvatar").put(upload.single("avatar"),authController.updateAvatar);
router.route("/updatePassword").put(authController.updatePassword);
router.route("/getUserInBulk").post(authController.getUserInBulk);
router.route("/getUserInfoByUsername").post( authController.getUserInfoByUsername);
router.route("/getUserNames").post( authController.getUserNames);
export default router;