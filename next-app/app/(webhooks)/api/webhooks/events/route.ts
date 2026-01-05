import { webhookEventSchema } from "@/app/(webhooks)/webhooks-config";
import { lookupKeyDataByKeyHashFromDb } from "@/db/apiKey";
import { updateJobStatus } from "@/db/job";
import { getTopKResultsFromVectorStore } from "@/lib/ai/utils/vector-similarity-search";
import { hashApiKey } from "@/lib/api-key";
import { handleApiError } from "@/lib/utils";
import {
  verifyWebhookSignature,
  extractWebhookData,
} from "@/lib/webhook/verification";

export async function POST(request: Request) {
  try {
    const { payload, signature } = await extractWebhookData(request);

    // Verify webhook signature
    const verification = verifyWebhookSignature(payload, signature);
    if (!verification.isValid) {
      return Response.json({ error: verification.error }, { status: 401 });
    }

    const { success, data } = webhookEventSchema.safeParse(payload);

    if (!success) {
      return Response.json(
        { error: "Invalid webhook payload" },
        { status: 400 },
      );
    }
    switch (data.eventType) {
      case "job.status.changed":
        await updateJobStatus({
          jobId: data.data.jobId,
          status: data.data.status,
        });

        break;
      case "mcp.toolcall":
        const apiKey = data.data.apiKey;

        if (!apiKey)
          return Response.json({
            retrievedContext: "ERROR: can't retrieve context. API key missing.",
          });

        const computedApiKeyHash = hashApiKey(apiKey);

        const keyData = await lookupKeyDataByKeyHashFromDb(computedApiKeyHash);
        const userId = keyData[0]?.userId;
        const apiKeyHashFromDb = keyData[0]?.apiKeyHash;

        if (!userId || apiKeyHashFromDb !== computedApiKeyHash)
          return Response.json({
            retrievedContext: "ERROR: can't retrieve context. Invalid API key.",
          });

        const documentChunksWithSimilarity =
          await getTopKResultsFromVectorStore({
            userId,
            k: 3,
            query: data.data.query,
          });

        if (!documentChunksWithSimilarity)
          return Response.json({
            retrievedContext:
              "ERROR: can't retrieve context due to unexpected error.",
          });
        return Response.json({
          retrievedContext: JSON.stringify(
            documentChunksWithSimilarity.map((chunk) => ({
              type: "text",
              text: chunk.pageContent,
            })),
          ),
        });

      default:
        return Response.json(
          { error: "Unimplemented event type" },
          { status: 400 },
        );
    }

    return Response.json({
      received: "ok",
    });
  } catch (error) {
    return handleApiError(error, "POST /api/webhooks/events");
  }
}
