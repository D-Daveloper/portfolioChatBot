import { Router } from "express";
import { Chat, get } from "../controllers/chat";

const router = Router();
router.route("/chat").post(Chat);
router.route("/chat").get(get);

export default router;