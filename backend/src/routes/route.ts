import { Router } from "express";
import goalroutes from "./goal.ts";
import authroutes from "./auth.ts";
const router:Router =Router();

router.use("/goal",goalroutes)
router.use("/auth",authroutes)
export default router;