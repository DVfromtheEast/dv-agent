import { llm } from "./lib/llm";

async function run() {
  const response = await llm.invoke(
    "Explain what an AI agent is in 2 sentences."
  );
  console.log(response.content);
}

run();
