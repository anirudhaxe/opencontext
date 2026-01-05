import { generateTextCall } from "@/lib/ai/llm";
import { jobQueue } from "@/queues";
import { handleApiError } from "@/lib/utils";
import auth from "@/lib/auth";
import { headers } from "next/headers";
import { createJob } from "@/db/job";

const withCors = (response: Response) => {
  // Set CORS headers (origin, methods, headers)
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  return response;
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session?.user?.id)
      return withCors(
        Response.json({ error: "Authetication failed" }, { status: 401 }),
      );

    const userId = session.user.id;

    // asseting body data types for now. This can be improved later
    const data: {
      text: string;
      assetType: "txt" | "video" | "doc";
      assetUrl: string;
    } = await request.json();

    if (
      !data.text ||
      typeof data.text !== "string" ||
      !data.assetType ||
      typeof data.assetType !== "string" ||
      !data.assetUrl ||
      typeof data.assetUrl !== "string"
    ) {
      return withCors(
        Response.json(
          {
            error: "Invalid request body",
          },
          { status: 400 },
        ),
      );
    }

    // Truncate text for title generation
    const truncatedText =
      data.text.length > 3000 ? data.text.substring(0, 3000) : data.text;

    let generatedTitle;
    await generateTextCall({
      system:
        "Create a brief, descriptive title (3-6 words, should be plain string, without starting and ending quotes) for sidebar display based on this raw text extracted from a web source:",
      prompt: truncatedText,
    })
      .then((result) => (generatedTitle = result.text))
      .catch((error) =>
        console.error(
          "Error while generating name(title) for text content:",
          error,
        ),
      );

    const result = await createJob({
      userId,
      name: generatedTitle || "PLACEHOLDER TITLE",
      status: "QUEUED",
      jobUrl: data.assetUrl,
      // by default take job type as TEXT
      type:
        data.assetType === "txt"
          ? "TEXT"
          : data.assetType === "video"
            ? "YT_VIDEO"
            : "TEXT",
    });

    const jobId = result[0]?.jobId;

    if (!jobId)
      return withCors(
        Response.json({ error: "Failed to create job" }, { status: 500 }),
      );

    // Add job to queue
    await jobQueue.add(jobId, {
      userId,
      jobId,
      jobName: generatedTitle,
      textData: data.text,
      jobType: data.assetType,
      jobUrl: data.assetUrl,
    });

    const response = Response.json({
      success: true,
      jobId: result[0].jobId,
      message: "Job created successfully",
    });

    return withCors(response);
  } catch (error) {
    return handleApiError(error, "POST /api/extensions/browser");
  }
}

// OPTIONS method for preflight requests
export async function OPTIONS() {
  const response = new Response(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  return response;
}
