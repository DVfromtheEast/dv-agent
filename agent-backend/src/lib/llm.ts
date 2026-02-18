import "dotenv/config";
import { ChatXAI } from "@langchain/xai";

export const llm = new ChatXAI({
  model: "grok-4-1-fast-reasoning",
  temperature: 0.5,
  apiKey: process.env.XAI_API_KEY,
});
