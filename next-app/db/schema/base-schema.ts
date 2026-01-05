import {
  // integer,
  pgTable,
  // boolean,
  // foreignKey,
  json,
  // jsonb,
  // primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { user } from "./auth-schema";

// add more types of job types later when working on multi modality, e.g. PDF, VIDEO etc
export const jobType = pgEnum("job_type", ["TEXT", "YT_VIDEO"]);
// these job status define the lifecycle of a job
export const jobStatus = pgEnum("job_status", [
  "QUEUED", // default status when a new job is created in the job table
  "CANCELLED", // job is cancelled by the worker/next-app-server due to some validation issue with the job
  "PROCESSING", // processing is started in the worker
  "ERROR", // if an error occurs while processing the job in worker
  "PROCESSED", // job successfully processed in worker
]);

// api key table
export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    // userId is unique as each user allowed to have one API key
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    apiKeyHash: text("key").notNull().unique(),
    apiKeyDisplay: text("api_key_display").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // index over key for optimized lookup
  (apiKeyTable) => [uniqueIndex("api_key_idx").on(apiKeyTable.apiKeyHash)],
);

// job table
export const job = pgTable("job", {
  // use this id as the master id of the job data in the vector store
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  // add this id also in the vector store metadata
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  // name of the job (will be generated at the time of insertion)
  name: text("name").notNull(),
  jobUrl: text("job_url"),
  status: jobStatus().notNull(),
  type: jobType().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// chat table
export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: text("chat_id").notNull(),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  // optionally implement tokenlens later
  // lastContext: jsonb("lastContext").$type<AppUsage | null>(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Chat = InferSelectModel<typeof chat>;

// message table
export const message = pgTable("message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  messageId: text("message_id").notNull(),
  chatDbId: uuid("chat_db_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;
