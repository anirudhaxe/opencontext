import vectorStore from "../vector-store";

export const getTopKResultsFromVectorStore = async ({
  userId,
  jobIds,
  k,
  query,
}: {
  userId: string;
  jobIds?: string[];
  k: number;
  query: string;
}) => {
  // return null if error connecting to vector store
  if (!vectorStore) return null;

  const vectorQueryFilter = {
    must: [
      {
        key: "metadata.userId",
        match: {
          value: userId,
        },
      },
      ...(jobIds?.length
        ? [{ key: "metadata.jobId", match: { any: jobIds } }]
        : []), // optional jobId filter
    ],
  };

  // searches for documents similar to a text query by embedding the query and performing a similarity search on the resulting vector and take the top K results
  const documentChunksWithSimilarity = await vectorStore.similaritySearch(
    query,
    k,
    vectorQueryFilter,
  );

  return documentChunksWithSimilarity;
};
