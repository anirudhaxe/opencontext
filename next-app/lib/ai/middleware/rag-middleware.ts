import type { LanguageModelV2Middleware } from "@ai-sdk/provider";
import { classiferCall, generateTextCall } from "@/lib/ai/llm";
import { getTopKResultsFromVectorStore } from "../utils/vector-similarity-search";

export const conditionalRagMiddleware: LanguageModelV2Middleware = {
  transformParams: async ({ params }) => {
    const { prompt: messages, providerOptions } = params;

    // return if providerOptions not provided (atleast userId is mandatory)
    if (!providerOptions) return params;

    const jobIds = providerOptions.conditionalRagMiddleware.jobIds as string[];
    const userId = providerOptions.conditionalRagMiddleware.userId as string;

    const recentMessage = messages.pop();

    // return if last message is from model
    if (!recentMessage || recentMessage.role !== "user") {
      if (recentMessage) {
        messages.push(recentMessage);
      }

      return params;
    }

    // extract text content from last user message
    const lastUserMessageContent = recentMessage.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    const { object: classification } = await classiferCall({
      prompt: lastUserMessageContent,
    });
    // only use RAG for questions
    if (classification !== "question") {
      messages.push(recentMessage);
      return params;
    }

    // generate a hypothetical answer -> run similarity search -> prepare final call

    const { text: hypotheticalAnswer } = await generateTextCall({
      system: "Answer the users question:",
      prompt: lastUserMessageContent,
    });

    // searches for documents similar to a text query by embedding the query and performing a similarity search on the resulting vector and take the top K results
    const documentChunksWithSimilarity = await getTopKResultsFromVectorStore({
      userId,
      jobIds,
      k: 3,
      query: hypotheticalAnswer,
    });

    if (!documentChunksWithSimilarity) return params;

    // add the chunks to the last user message
    messages.push({
      role: "user",
      content: [
        ...recentMessage.content,
        {
          type: "text",
          text: "Here is some relevant information that you can use to answer the question:",
        },
        ...documentChunksWithSimilarity.map((chunk) => ({
          type: "text" as const,
          text: chunk.pageContent,
        })),
      ],
    });

    return { ...params, prompt: messages };
  },
};
