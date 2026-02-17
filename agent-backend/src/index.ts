import crypto from "crypto";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { llm } from "./lib/llm.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const sessions = new Map<string, Message[]>();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("dv-agent backend is running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const id = sessionId || crypto.randomUUID();
    const history = sessions.get(id) || [];

    const langchainHistory = history.map((msg) =>
      msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );
    langchainHistory.push(new HumanMessage(message));

    const response = await llm.invoke(langchainHistory);

    const reply =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });

    sessions.set(id, history);

    res.json({
      reply,
      sessionId: id,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
