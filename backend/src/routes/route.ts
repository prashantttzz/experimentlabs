import { Router } from "express";
import goalroutes from "./goal";
import authroutes from "./auth";
const router:Router =Router();

router.use("/goal",goalroutes)
router.use("/auth",authroutes)
export default router;