import { Router } from "express";
import goalroutes from "./goal.js";
import authroutes from "./auth.js";
const router = Router();
router.use("/goal", goalroutes);
router.use("/auth", authroutes);
export default router;
