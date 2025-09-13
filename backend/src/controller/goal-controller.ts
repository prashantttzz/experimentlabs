import type{ Response } from "express";
import { evaluateAssessment } from "../ai/ai-unlock.ts";
import { generateAiJourneyChunks } from "../ai/ai-service.ts";
import prisma from "../../prisma/prisma.ts";

const calculateGoalProgress = (goal: any) => {
    if (!goal || !goal.chunks) return 0;
    const totalChunks = goal.chunks.length;
    if (totalChunks === 0) return 0;
    const completedChunks = goal.chunks.filter(
      (chunk: any) => chunk.status === "COMPLETED"
    ).length;
    return Math.round((completedChunks / totalChunks) * 100);
};


export const createNewGoal = async (req: any, res: Response) => {
  const {userId} = req.user!; 
  const { title, description, timeline } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  try {
    const journeyChunks = await generateAiJourneyChunks(title, description, timeline);
    const chunksToCreate = journeyChunks.map((chunk: any, index: number) => ({
      ...chunk,
      status: index === 0 ? "CURRENT" : "LOCKED",
    }));

    const newGoal = await prisma.goal.create({
      data: {
        title,
        description,
        status: "IN_PROGRESS",
        timeline,
        userId,
        chunks: { create: chunksToCreate },
      },
      include: {
        chunks: { orderBy: { order: "asc" } },
      },
    });

    res.status(201).json({ data: newGoal });
  } catch (error) {
    console.error("Error creating new goal:", error);
    res.status(500).json({ error: "Unable to create new goal." });
  }
};

export const getAllGoals = async (req: any, res: Response) => {
  const userId = req.user!.id;
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        chunks: {
          select: { status: true,title:true }, 
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const goalsWithProgress = goals.map(goal => ({
        ...goal,
        progress: calculateGoalProgress(goal)
    }));

    res.status(200).json({ data: goalsWithProgress });
  } catch (error: any) {
    res.status(500).json({ error: "Unable to fetch goals." });
  }
};

export const fetchGoalById = async (req: any, res: Response) => {
  const { id } = req.params;
  const {userId} = req.user!; 
  try {
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        chunks: {
          orderBy: { order: "asc" },
        },
      },
    });
    
    if (!goal) {
        return res.status(404).json({ error: "Goal not found or you do not have permission to view it." });
    }
    
    const goalWithProgress = {
        ...goal,
        progress: calculateGoalProgress(goal)
    };

    return res.status(200).json({ data: goalWithProgress });
  } catch (error: any) {
    return res.status(500).json({ error: "Unable to fetch goal." });
  }
};

export const chatHistory = async (req: any, res: Response) => {
  try {
    const { chunkId } = req.params;
    const userId = req.user!.id;

    const chunk = await prisma.chunk.findFirst({
        where: {
            id: chunkId,
            goal: {
                userId: userId,
            }
        }
    });

    if (!chunk) {
        return res.status(404).json({ error: "Chat history not found or you are not authorized." });
    }
    
    const history = await prisma.chatMessage.findMany({
      where: { chunkId },
      orderBy: { createdAt: 'asc' }
    });
    
    return res.status(200).json({ data: history });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch chat history." });
  }
};

export const assessChunk = async (req: any, res: Response) => {
  const { goalId, chunkId } = req.params;
  const userId = req.user!.id;

  try {
    const chunkToAssess = await prisma.chunk.findFirst({
      where: { id: chunkId, goalId, status: "CURRENT", goal: { userId } },
      include: { chatHistory: { orderBy: { createdAt: "asc" } } },
    });

    if (!chunkToAssess) {
      return res.status(404).json({ error: "Chunk not found or not eligible for assessment." });
    }
    
    if (chunkToAssess.chatHistory.length < 2) {
      return res.status(400).json({ error: "You must chat with the AI Tutor before anying an assessment." });
    }

    const evaluation = await evaluateAssessment(chunkToAssess.chatHistory, {
      description: chunkToAssess.description,
      objectives: chunkToAssess.objectives,
      skills: chunkToAssess.skills,
    });

    if (evaluation.assessment !== "passed") {
      return res.status(400).json({
        error: "Assessment not passed. Please review the material and try again.",
        feedback: evaluation.feedback,
      });
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const chunkToComplete = await tx.chunk.findUnique({ where: { id: chunkId } });
      if (!chunkToComplete || chunkToComplete.status !== "CURRENT") {
        throw new Error("Chunk cannot be completed at this time.");
      }

      await tx.chunk.update({ where: { id: chunkId }, data: { status: "COMPLETED" } });

      const nextChunk = await tx.chunk.findFirst({
        where: { goalId: goalId, order: chunkToComplete.order + 1 },
      });

      if (nextChunk) {
        await tx.chunk.update({ where: { id: nextChunk.id }, data: { status: "CURRENT" } });
      } else {
        await tx.goal.update({ where: { id: goalId }, data: { status: "COMPLETED" } });
      }
      return { message: "Assessment passed and progress updated!" };
    });

    res.status(200).json({ data: transactionResult });
  } catch (error) {
    console.error("Assessment controller error:", error);
    res.status(500).json({ error: "An error occurred during the assessment." });
  }
};

