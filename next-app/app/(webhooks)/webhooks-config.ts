import { jobStatus } from "@/db/schema";
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
 * Generic type for interpretting custom job events and selections
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
  selections: jobStatus.enumValues,
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

export { webhookEventSchema };
