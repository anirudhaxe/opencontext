import z from "zod";

/**
 * Providers
 **/
const providers = ["opencontext-worker"];

/**
 * Base Schema for all webhook events
 **/
const baseSchema = z.object({
  provider: z.enum(providers),
  eventId: z.uuid(),
  timestamp: z.iso.datetime(),
});

/**
 * Generic type for interpreting custom job events and selections
 **/
type JobEventConfig<T extends string, S extends readonly string[]> = {
  event: T;
  selections: S;
};

/**
 * mcp event webhooks config
 **/
// Helper function to extend the base schema with custom mcp eventTypes and data types
function createMcpEventSchema<T extends string, S extends readonly string[]>(
  config: JobEventConfig<T, S>,
) {
  // extend base schema with custom fields
  return baseSchema.extend({
    eventType: z.literal(config.event),
    data: z.object({
      apiKey: z.string(),
      query: z.string(),
      selection: z.enum(config.selections),
    }),
  });
}

// Define custom mcp events
const toolcallEvent = {
  event: "mcp.toolcall",
  selections: ["context_retriever"],
} as const;

// Create schemas for custom job events
const mcpToolSchema = createMcpEventSchema(toolcallEvent);

/**
 * Job event webhooks config
 **/
// Helper function to extend the base schema with custom job eventTypes and data types
function createJobEventSchema<T extends string, S extends readonly string[]>(
  config: JobEventConfig<T, S>,
) {
  // extend base schema with custom fields
  return baseSchema.extend({
    eventType: z.literal(config.event),
    data: z.object({
      jobId: z.string(),
      status: z.enum(config.selections),
    }),
  });
}

// Define custom job events
const statusEvent = {
  event: "job.status.changed",
  selections: [
    "QUEUED", // default status when a new job is created in the job table
    "CANCELLED", // job is cancelled by the worker/next-app-server due to some validation issue with the job
    "PROCESSING", // processing is started in the worker
    "ERROR", // if an error occurs while processing the job in worker
    "PROCESSED", // job successfully processed in worker
  ],
} as const;

// const priorityEvent = {
//   event: "job.priority.updated",
//   selections: ["low", "medium", "high"],
// } as const;

// Create schemas for custom job events
const statusSchema = createJobEventSchema(statusEvent);
// const prioritySchema = createJobEventSchema(priorityEvent);

/**
 * Perform a discriminated union based on the field "eventType"
 **/
const webhookEventSchema = z.discriminatedUnion("eventType", [
  statusSchema,
  // prioritySchema,
  mcpToolSchema,
]);

// const mcpEventschema = z.discriminatedUnion("eventType", [mcpToolSchema]);

// const webhookEventSchema = z.union([jobEventSchema, mcpEventschema]);

export type webhookEventType = z.infer<typeof webhookEventSchema>;

export { webhookEventSchema };
