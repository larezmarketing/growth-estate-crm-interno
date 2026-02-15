import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { encrypt, decrypt } from "./encryption";
import { validateSMTP, getProviderConfig } from "./emailValidator";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { generateEmailSequence, regenerateEmail } from "./emailGenerator";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  workspaces: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getWorkspacesByUser(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        industry: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const workspaceId = await db.createWorkspace({
          name: input.name,
          description: input.description,
          industry: input.industry,
          createdBy: ctx.user.id,
        });
        
        // Add creator as admin
        await db.addWorkspaceMember({
          userId: ctx.user.id,
          workspaceId: Number(workspaceId),
          role: "admin",
        });
        
        return { id: workspaceId };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const workspace = await db.getWorkspaceById(input.id);
        if (!workspace) {
          throw new Error("Workspace not found");
        }
        
        // Check if user has access
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.id);
        if (!role) {
          throw new Error("Access denied");
        }
        
        return { ...workspace, userRole: role };
      }),
    
    getMembers: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user has access
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (!role) {
          throw new Error("Access denied");
        }
        
        return await db.getWorkspaceMembers(input.workspaceId);
      }),
  }),

  emailAccounts: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user has access to workspace
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (!role) {
          throw new Error("Access denied");
        }
        
        const accounts = await db.getEmailAccountsByWorkspace(input.workspaceId);
        
        // Don't send passwords to frontend
        return accounts.map(acc => ({
          ...acc,
          smtpPassword: undefined,
          imapPassword: undefined,
        }));
      }),
    
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        email: z.string().email(),
        provider: z.string(),
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(),
        smtpUsername: z.string().optional(),
        smtpPassword: z.string().optional(),
        imapHost: z.string().optional(),
        imapPort: z.number().optional(),
        imapUsername: z.string().optional(),
        imapPassword: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has admin access to workspace
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (role !== "admin") {
          throw new Error("Only admins can add email accounts");
        }
        
        // Get provider config if using known provider
        const providerConfig = getProviderConfig(input.provider);
        
        const smtpHost = input.smtpHost || providerConfig?.smtp.host;
        const smtpPort = input.smtpPort || providerConfig?.smtp.port;
        const smtpUsername = input.smtpUsername || input.email;
        const smtpPassword = input.smtpPassword;
        
        if (!smtpHost || !smtpPort || !smtpPassword) {
          throw new Error("Missing SMTP configuration");
        }
        
        // Validate SMTP credentials
        const validation = await validateSMTP({
          host: smtpHost,
          port: smtpPort,
          username: smtpUsername,
          password: smtpPassword,
        });
        
        if (!validation.valid) {
          throw new Error(`SMTP validation failed: ${validation.error}`);
        }
        
        // Encrypt passwords before storing
        const encryptedSmtpPassword = encrypt(smtpPassword);
        const encryptedImapPassword = input.imapPassword ? encrypt(input.imapPassword) : null;
        
        const accountId = await db.createEmailAccount({
          workspaceId: input.workspaceId,
          email: input.email,
          provider: input.provider,
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword: encryptedSmtpPassword,
          imapHost: input.imapHost || providerConfig?.imap.host,
          imapPort: input.imapPort || providerConfig?.imap.port,
          imapUsername: input.imapUsername || input.email,
          imapPassword: encryptedImapPassword,
          isActive: true,
          lastVerified: new Date(),
        });
        
        return { id: accountId };
      }),
    
    verify: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const account = await db.getEmailAccountById(input.accountId);
        if (!account) {
          throw new Error("Email account not found");
        }
        
        // Check if user has access to workspace
        const role = await db.getUserWorkspaceRole(ctx.user.id, account.workspaceId);
        if (!role) {
          throw new Error("Access denied");
        }
        
        if (!account.smtpPassword) {
          throw new Error("No SMTP credentials found");
        }
        
        // Decrypt password and validate
        const decryptedPassword = decrypt(account.smtpPassword);
        
        const validation = await validateSMTP({
          host: account.smtpHost!,
          port: account.smtpPort!,
          username: account.smtpUsername!,
          password: decryptedPassword,
        });
        
        // Update verification status
        await db.updateEmailAccountStatus(
          input.accountId,
          validation.valid,
          validation.valid ? new Date() : undefined
        );
        
        return {
          valid: validation.valid,
          error: validation.error,
        };
      }),
  }),

  knowledgeBase: router({
    get: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user has access to workspace
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (!role) {
          throw new Error("Access denied");
        }
        
        let kb = await db.getKnowledgeBaseByWorkspace(input.workspaceId);
        
        // Create knowledge base if it doesn't exist
        if (!kb) {
          const kbId = await db.createKnowledgeBase({
            workspaceId: input.workspaceId,
          });
          kb = await db.getKnowledgeBaseByWorkspace(input.workspaceId);
        }
        
        // Get associated files
        const files = kb ? await db.getKnowledgeBaseFiles(kb.id) : [];
        
        return {
          ...kb,
          files,
        };
      }),
    
    update: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        toneOfVoice: z.string().optional(),
        products: z.string().optional(),
        services: z.string().optional(),
        businessContext: z.string().optional(),
        targetAudience: z.string().optional(),
        campaignGoals: z.string().optional(),
        additionalInfo: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        let kb = await db.getKnowledgeBaseByWorkspace(input.workspaceId);
        
        if (!kb) {
          // Create new knowledge base
          await db.createKnowledgeBase({
            workspaceId: input.workspaceId,
            toneOfVoice: input.toneOfVoice,
            products: input.products,
            services: input.services,
            businessContext: input.businessContext,
            targetAudience: input.targetAudience,
            campaignGoals: input.campaignGoals,
            additionalInfo: input.additionalInfo,
          });
        } else {
          // Update existing knowledge base
          await db.updateKnowledgeBase(kb.id, {
            toneOfVoice: input.toneOfVoice,
            products: input.products,
            services: input.services,
            businessContext: input.businessContext,
            targetAudience: input.targetAudience,
            campaignGoals: input.campaignGoals,
            additionalInfo: input.additionalInfo,
          });
        }
        
        return { success: true };
      }),
    
    uploadFile: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        // Get or create knowledge base
        let kb = await db.getKnowledgeBaseByWorkspace(input.workspaceId);
        if (!kb) {
          const kbId = await db.createKnowledgeBase({
            workspaceId: input.workspaceId,
          });
          kb = await db.getKnowledgeBaseByWorkspace(input.workspaceId);
        }
        
        if (!kb) {
          throw new Error("Failed to create knowledge base");
        }
        
        // Decode base64 file data
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique file key
        const fileKey = `knowledge-base/${input.workspaceId}/${nanoid()}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
        
        // Save file metadata to database
        const fileId = await db.addKnowledgeBaseFile({
          knowledgeBaseId: kb.id,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: fileBuffer.length,
        });
        
        return {
          id: fileId,
          url,
        };
      }),
    
    deleteFile: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        fileId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        // Delete from database (S3 file remains for now)
        await db.deleteKnowledgeBaseFile(input.fileId);
        
        return { success: true };
      }),
  }),

  campaigns: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user has access to workspace
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (!role) {
          throw new Error("Access denied");
        }
        
        return await db.getCampaignsByWorkspace(input.workspaceId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        workspaceId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        sendInterval: z.number().default(3),
        generateEmails: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, input.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        // Create campaign
        const campaignId = await db.createCampaign({
          workspaceId: input.workspaceId,
          name: input.name,
          description: input.description,
          sendInterval: input.sendInterval,
          status: "draft",
          createdBy: ctx.user.id,
        });
        
        // Generate emails using AI if requested
        if (input.generateEmails) {
          const kb = await db.getKnowledgeBaseByWorkspace(input.workspaceId);
          
          if (!kb) {
            throw new Error("Knowledge base not found. Please set up your client information first.");
          }
          
          // Generate 10 emails using AI
          const generatedEmails = await generateEmailSequence(kb, input.name);
          
          // Save generated emails to database
          for (const email of generatedEmails) {
            await db.createEmail({
              campaignId: Number(campaignId),
              sequenceNumber: email.sequenceNumber,
              subject: email.subject,
              bodyHtml: email.bodyHtml,
              bodyText: email.bodyText,
              previewText: email.previewText,
            });
          }
        }
        
        return { id: campaignId };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.id);
        if (!campaign) {
          throw new Error("Campaign not found");
        }
        
        // Check if user has access to workspace
        const role = await db.getUserWorkspaceRole(ctx.user.id, campaign.workspaceId);
        if (!role) {
          throw new Error("Access denied");
        }
        
        // Get emails in the campaign
        const emails = await db.getEmailsByCampaign(input.id);
        
        return {
          ...campaign,
          emails,
        };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "active", "paused", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.id);
        if (!campaign) {
          throw new Error("Campaign not found");
        }
        
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, campaign.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        await db.updateCampaign(input.id, {
          status: input.status,
          startDate: input.status === "active" && !campaign.startDate ? new Date() : campaign.startDate,
        });
        
        return { success: true };
      }),
  }),

  emails: router({
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        subject: z.string().optional(),
        bodyHtml: z.string().optional(),
        bodyText: z.string().optional(),
        previewText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get email to check campaign access
        const emails = await db.getEmailsByCampaign(input.id);
        if (emails.length === 0) {
          throw new Error("Email not found");
        }
        
        const email = emails.find(e => e.id === input.id);
        if (!email) {
          throw new Error("Email not found");
        }
        
        const campaign = await db.getCampaignById(email.campaignId);
        if (!campaign) {
          throw new Error("Campaign not found");
        }
        
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, campaign.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        await db.updateEmail(input.id, {
          subject: input.subject,
          bodyHtml: input.bodyHtml,
          bodyText: input.bodyText,
          previewText: input.previewText,
        });
        
        return { success: true };
      }),
    
    regenerate: protectedProcedure
      .input(z.object({
        id: z.number(),
        campaignId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.campaignId);
        if (!campaign) {
          throw new Error("Campaign not found");
        }
        
        // Check if user has editor or admin access
        const role = await db.getUserWorkspaceRole(ctx.user.id, campaign.workspaceId);
        if (role !== "admin" && role !== "editor") {
          throw new Error("Access denied");
        }
        
        const kb = await db.getKnowledgeBaseByWorkspace(campaign.workspaceId);
        if (!kb) {
          throw new Error("Knowledge base not found");
        }
        
        // Get current email and surrounding emails for context
        const campaignEmails = await db.getEmailsByCampaign(input.campaignId);
        const currentEmail = campaignEmails.find(e => e.id === input.id);
        
        if (!currentEmail) {
          throw new Error("Email not found");
        }
        
        const previousEmail = campaignEmails.find(e => e.sequenceNumber === currentEmail.sequenceNumber - 1);
        const nextEmail = campaignEmails.find(e => e.sequenceNumber === currentEmail.sequenceNumber + 1);
        
        // Regenerate email using AI
        const regenerated = await regenerateEmail(
          kb,
          currentEmail.sequenceNumber,
          previousEmail?.bodyText || undefined,
          nextEmail?.bodyText || undefined
        );
        
        // Update email in database
        await db.updateEmail(input.id, {
          subject: regenerated.subject,
          bodyHtml: regenerated.bodyHtml,
          bodyText: regenerated.bodyText,
          previewText: regenerated.previewText,
        });
        
        return regenerated;
      }),
  }),
});

export type AppRouter = typeof appRouter;
