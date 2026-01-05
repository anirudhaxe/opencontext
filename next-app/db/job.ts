import { and, eq, ilike } from "drizzle-orm";
import db from ".";
import { job, jobStatus, jobType } from "./schema";
import { z } from "zod";

const createJobSchema = z.object({
  userId: z.string(),
  name: z.string(),
  jobUrl: z.string().optional(),
  status: z.enum(jobStatus.enumValues),
  type: z.enum(jobType.enumValues),
});

const createJob = ({
  userId,
  name,
  jobUrl,
  status,
  type,
}: z.infer<typeof createJobSchema>) => {
  return db
    .insert(job)
    .values({
      userId,
      name,
      jobUrl,
      status,
      type,
    })
    .returning({ jobId: job.id });
};

const updateJobStatusSchema = z.object({
  jobId: z.string(),
  status: z.enum(jobStatus.enumValues),
});

const updateJobStatus = ({
  jobId,
  status,
}: z.infer<typeof updateJobStatusSchema>) => {
  return db.update(job).set({ status }).where(eq(job.id, jobId));
};

const getJobsFromDbSchema = z.object({
  userId: z.string(),
  nameSearchQuery: z.string().optional(),
  type: z.enum(jobType.enumValues).optional(),
  status: z.enum(jobStatus.enumValues).optional(),
});

const getJobsFromDb = ({
  userId,
  nameSearchQuery,
  type,
  status,
}: z.infer<typeof getJobsFromDbSchema>) => {
  const whereConditions = [eq(job.userId, userId)];

  if (nameSearchQuery) {
    whereConditions.push(ilike(job.name, `%${nameSearchQuery}%`));
  }
  if (type) {
    whereConditions.push(eq(job.type, type));
  }
  if (status) {
    whereConditions.push(eq(job.status, status));
  }

  return db
    .select()
    .from(job)
    .where(and(...whereConditions));
};

const deleteJobFromDb = ({
  jobId,
  userId,
}: {
  jobId: string;
  userId: string;
}) => {
  return db
    .delete(job)
    .where(and(eq(job.id, jobId), eq(job.userId, userId)))
    .returning({ id: job.id });
};

export { getJobsFromDb, updateJobStatus, deleteJobFromDb, createJob };
