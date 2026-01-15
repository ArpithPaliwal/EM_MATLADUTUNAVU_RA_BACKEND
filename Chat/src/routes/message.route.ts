import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
const messageController = new MessageController();
router.use(verifyJWT);
router
  .route("/sendMessage")
  .post(upload.single("attachment"), messageController.sendMessage);
router.route("/getMessages/:conversationId").get(messageController.getMessages);


export default router;