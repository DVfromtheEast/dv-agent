import crypto from "crypto";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { llm } from "./lib/llm.js";
import { createAgent, tool } from "langchain";
import { searchWeb } from "./services/searchManager.js";
import * as z from "zod";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const sessions = new Map<string, Message[]>();

const webSearch = tool(
  async ({ query }) => {
    return await searchWeb(query);
  },
  {
    name: "web_search",
    description:
      "Search the web for current information, news, or factual data",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

const app = express();
const PORT = 3001;

// agent
const agent = createAgent({
  model: llm,
  tools: [webSearch],
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  })
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("dv-agent backend is running 🚀");
});

function extractAgentText(response: any): string {
  const last = response.messages?.[response.messages.length - 1];
  if (!last) return "";

  if (typeof last.content === "string") return last.content;

  if (Array.isArray(last.content)) {
    return last.content
      .map((block: any) =>
        typeof block === "string" ? block : "text" in block ? block.text : ""
      )
      .join("");
  }

  return "";
}

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const id = sessionId || crypto.randomUUID();
    const history = sessions.get(id) || [];

    const response = await agent.invoke({
      messages: [...history, { role: "user", content: message }],
    });

    const reply = extractAgentText(response);

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
