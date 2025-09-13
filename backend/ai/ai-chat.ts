import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient, SenderRole } from "@prisma/client";
import dotenv, { config } from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const initializeSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("sendMessage", async (data) => {
      const { message, moduleTitle, goalTitle, history, chunkId } = data;
      if (!chunkId) {
        return socket.emit("receiveMessage", {
          content: "Error: Missing chunk ID. Cannot save message.",
          sender: "ai",
        });
      }
      try {
       const res = await prisma.chatMessage.create({
          data: {
            content: message,
            sender: SenderRole.USER,
            chunkId: chunkId,
          },
        });
        const systemPrompt = `You are an expert, friendly, and encouraging AI Tutor.
        The user's main goal is to "${goalTitle}".
        They are currently studying the module: "${moduleTitle}".
        Keep your answers concise, helpful, and directly related to the user's question and learning module.
        
        **Format your response using Markdown.**
        - Use bolding for key terms with **double asterisks**.
        - Use bullet points for lists.
        - **CRITICAL: For all code examples, you MUST wrap them in triple backticks with the language specified.** For example:
        \`\`\`javascript
        // your javascript code here
        \`\`\`
        \`\`\`python
        # your python code here
        \`\`\`
        `;
        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...history,
          ],
          generationConfig: { maxOutputTokens: 1500 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const aiText = response.text();

        // Save the AI's response to the database using the enum
        await prisma.chatMessage.create({
          data: {
            content: aiText,
            sender: SenderRole.AI, // Use the enum here
            chunkId: chunkId,
          },
        });

        socket.emit("receiveMessage", {
          id: Date.now(),
          content: aiText,
          sender: "ai",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error processing message:", error);
        socket.emit("receiveMessage", {
          content: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  console.log("Socket.IO service initialized.");
};
