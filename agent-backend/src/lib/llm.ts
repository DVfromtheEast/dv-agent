import "dotenv/config";
import { ChatXAI } from "@langchain/xai";

export const llm = new ChatXAI({
  model: "grok-4-1-fast",
  temperature: 0.7,
  apiKey: process.env.XAI_API_KEY,
});
