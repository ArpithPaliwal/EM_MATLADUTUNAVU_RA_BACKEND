import {Router} from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { ConversationController } from '../controllers/Conversation.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();
const conversationController = new ConversationController();
router.use(verifyJWT);
router.route('/createGroupConversation').post(upload.single('groupAvatar'), conversationController.createGroupConversation);
router.route('/createPrivateConversation').post(conversationController.createPrivateConversation);
router.route('/getUserConversations').get(conversationController.getUserConversations);
router.route('/updateGroupAvatar/:groupId').patch(upload.single('groupAvatar'),conversationController.updateGroupAvatar);
router.route('/updateGroupName/:groupId').patch(conversationController.updateGroupName)
router.route('/leaveGroup/:groupId').patch(conversationController.leaveGroup)
export default router