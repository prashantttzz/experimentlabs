import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { PrismaClient } from "@prisma/client";
import routes from "./routes/route.ts";
import { initializeSocket } from "./ai/ai-chat.ts";

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Achievo backend running 🚀" });
});
app.use("/api", routes);
initializeSocket(server);
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
