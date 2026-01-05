export const toolResponse = (output: { retrievedContext: string }) => {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    structuredContent: output,
  };
};
