import { integer, pgEnum, pgTable, text, timestamp, varchar, serial, boolean } from "drizzle-orm/pg-core";

/**
 * PostgreSQL enums for type safety
 */
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const workspaceMemberRoleEnum = pgEnum('workspace_member_role', ['admin', 'editor', 'viewer']);
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'active', 'paused', 'completed']);
export const scheduledEmailStatusEnum = pgEnum('scheduled_email_status', ['pending', 'sent', 'failed', 'cancelled']);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Workspaces represent clients managed by the agency
 */
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  industry: varchar("industry", { length: 100 }),
  logoUrl: text("logoUrl"),
  createdBy: integer("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

/**
 * Workspace members with role-based access control
 */
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  workspaceId: integer("workspaceId").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  role: workspaceMemberRoleEnum("role").default("viewer").notNull(),
  invitedBy: integer("invitedBy").references(() => users.id),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

/**
 * Email accounts connected to workspaces (SMTP/IMAP credentials)
 */
export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspaceId").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  email: varchar("email", { length: 320 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'gmail', 'outlook', 'custom'
  smtpHost: varchar("smtpHost", { length: 255 }),
  smtpPort: integer("smtpPort"),
  smtpUsername: varchar("smtpUsername", { length: 255 }),
  smtpPassword: text("smtpPassword"), // Encrypted
  imapHost: varchar("imapHost", { length: 255 }),
  imapPort: integer("imapPort"),
  imapUsername: varchar("imapUsername", { length: 255 }),
  imapPassword: text("imapPassword"), // Encrypted
  isActive: boolean("isActive").default(true).notNull(),
  lastVerified: timestamp("lastVerified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = typeof emailAccounts.$inferInsert;

/**
 * Knowledge base for each workspace (client information)
 */
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspaceId").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  toneOfVoice: text("toneOfVoice"),
  products: text("products"),
  services: text("services"),
  businessContext: text("businessContext"),
  targetAudience: text("targetAudience"),
  campaignGoals: text("campaignGoals"),
  additionalInfo: text("additionalInfo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

/**
 * Knowledge base files stored in S3
 */
export const knowledgeBaseFiles = pgTable("knowledge_base_files", {
  id: serial("id").primaryKey(),
  knowledgeBaseId: integer("knowledgeBaseId").notNull().references(() => knowledgeBase.id, { onDelete: 'cascade' }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: integer("fileSize"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type KnowledgeBaseFile = typeof knowledgeBaseFiles.$inferSelect;
export type InsertKnowledgeBaseFile = typeof knowledgeBaseFiles.$inferInsert;

/**
 * Email campaigns (each campaign has 10 emails)
 */
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspaceId").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: campaignStatusEnum("status").default("draft").notNull(),
  sendInterval: integer("sendInterval").default(3).notNull(), // Days between emails
  startDate: timestamp("startDate"),
  createdBy: integer("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Individual emails in a campaign sequence
 */
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaignId").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  sequenceNumber: integer("sequenceNumber").notNull(), // 1-10
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("bodyHtml").notNull(),
  bodyText: text("bodyText"),
  previewText: varchar("previewText", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

/**
 * Scheduled emails for automatic sending
 */
export const scheduledEmails = pgTable("scheduled_emails", {
  id: serial("id").primaryKey(),
  emailId: integer("emailId").notNull().references(() => emails.id, { onDelete: 'cascade' }),
  campaignId: integer("campaignId").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  workspaceId: integer("workspaceId").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  scheduledFor: timestamp("scheduledFor").notNull(),
  sentAt: timestamp("sentAt"),
  status: scheduledEmailStatusEnum("status").default("pending").notNull(),
  errorMessage: text("errorMessage"),
  retryCount: integer("retryCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduledEmail = typeof scheduledEmails.$inferSelect;
export type InsertScheduledEmail = typeof scheduledEmails.$inferInsert;

/**
 * Email metrics for tracking opens, clicks, conversions
 */
export const emailMetrics = pgTable("email_metrics", {
  id: serial("id").primaryKey(),
  scheduledEmailId: integer("scheduledEmailId").notNull().references(() => scheduledEmails.id, { onDelete: 'cascade' }),
  emailId: integer("emailId").notNull().references(() => emails.id, { onDelete: 'cascade' }),
  campaignId: integer("campaignId").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  workspaceId: integer("workspaceId").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opens: integer("opens").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  firstOpenedAt: timestamp("firstOpenedAt"),
  lastOpenedAt: timestamp("lastOpenedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailMetric = typeof emailMetrics.$inferSelect;
export type InsertEmailMetric = typeof emailMetrics.$inferInsert;

/**
 * Activity logs for audit trail
 */
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  workspaceId: integer("workspaceId").references(() => workspaces.id, { onDelete: 'cascade' }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: integer("entityId"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
