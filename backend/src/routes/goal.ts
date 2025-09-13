import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { assessChunk, chatHistory, createNewGoal, fetchGoalById, getAllGoals } from "../controller/goal-controller";
const router: Router = Router();

router.post("/new", authMiddleware, createNewGoal);

router.get("/all", authMiddleware,getAllGoals);

router.get("/:id", authMiddleware,fetchGoalById);

router.post("/:goalId/chunks/:chunkId/assess", authMiddleware,assessChunk);
router.get("/chunks/:chunkId/chathistory", authMiddleware,chatHistory);
export default router;
