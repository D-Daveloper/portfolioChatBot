import { Router } from "express";
import { Chroma, get } from "../controllers/chroma";

const router = Router();
router.route("/chroma").post(Chroma);
router.route("/chroma").get(get);

export default router;