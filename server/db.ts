import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, 
  users,
  workspaces,
  InsertWorkspace,
  workspaceMembers,
  InsertWorkspaceMember,
  emailAccounts,
  InsertEmailAccount,
  knowledgeBase,
  InsertKnowledgeBase,
  knowledgeBaseFiles,
  InsertKnowledgeBaseFile,
  campaigns,
  InsertCampaign,
  emails,
  InsertEmail
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Workspace queries
export async function createWorkspace(workspace: InsertWorkspace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workspaces).values(workspace).returning({ id: workspaces.id });
  return result[0].id;
}

export async function getWorkspacesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      workspace: workspaces,
      member: workspaceMembers,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId));
  
  return result.map(r => ({
    ...r.workspace,
    role: r.member.role,
  }));
}

export async function getWorkspaceById(workspaceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addWorkspaceMember(member: InsertWorkspaceMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workspaceMembers).values(member).returning({ id: workspaceMembers.id });
  return result[0].id;
}

export async function getWorkspaceMembers(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      member: workspaceMembers,
      user: users,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId));
  
  return result.map(r => ({
    ...r.member,
    user: r.user,
  }));
}

export async function getUserWorkspaceRole(userId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0].role : null;
}

// Email account queries
export async function createEmailAccount(account: InsertEmailAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(emailAccounts).values(account).returning({ id: emailAccounts.id });
  return result[0].id;
}

export async function getEmailAccountsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.workspaceId, workspaceId));
  
  return result;
}

export async function getEmailAccountById(accountId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.id, accountId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmailAccountStatus(accountId: number, isActive: boolean, lastVerified?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(emailAccounts)
    .set({ isActive, lastVerified })
    .where(eq(emailAccounts.id, accountId));
}

// Knowledge base queries
export async function createKnowledgeBase(kb: InsertKnowledgeBase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(knowledgeBase).values(kb).returning({ id: knowledgeBase.id });
  return result[0].id;
}

export async function getKnowledgeBaseByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(knowledgeBase)
    .where(eq(knowledgeBase.workspaceId, workspaceId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateKnowledgeBase(id: number, data: Partial<InsertKnowledgeBase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(knowledgeBase)
    .set(data)
    .where(eq(knowledgeBase.id, id));
}

export async function addKnowledgeBaseFile(file: InsertKnowledgeBaseFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(knowledgeBaseFiles).values(file).returning({ id: knowledgeBaseFiles.id });
  return result[0].id;
}

export async function getKnowledgeBaseFiles(knowledgeBaseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(knowledgeBaseFiles)
    .where(eq(knowledgeBaseFiles.knowledgeBaseId, knowledgeBaseId));
  
  return result;
}

export async function deleteKnowledgeBaseFile(fileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(knowledgeBaseFiles)
    .where(eq(knowledgeBaseFiles.id, fileId));
}

// Campaign queries
export async function createCampaign(campaign: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(campaigns).values(campaign).returning({ id: campaigns.id });
  return result[0].id;
}

export async function getCampaignsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.workspaceId, workspaceId))
    .orderBy(campaigns.createdAt);
  
  return result;
}

export async function getCampaignById(campaignId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(campaigns)
    .set(data)
    .where(eq(campaigns.id, id));
}

// Email queries
export async function createEmail(email: InsertEmail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(emails).values(email).returning({ id: emails.id });
  return result[0].id;
}

export async function getEmailsByCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(emails)
    .where(eq(emails.campaignId, campaignId))
    .orderBy(emails.sequenceNumber);
  
  return result;
}

export async function updateEmail(id: number, data: Partial<InsertEmail>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(emails)
    .set(data)
    .where(eq(emails.id, id));
}

export async function deleteEmail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(emails)
    .where(eq(emails.id, id));
}
