import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import routes from "./routes/route.js";
import { initializeSocket } from "./ai/ai-chat.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
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
