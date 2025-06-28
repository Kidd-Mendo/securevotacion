import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertElectionSchema, insertCandidateSchema, insertVoteSchema } from "@shared/schema";
import crypto from "crypto";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Elections endpoints
  app.get('/api/elections', isAuthenticated, async (req, res) => {
    try {
      const elections = await storage.getElections();
      res.json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ message: "Failed to fetch elections" });
    }
  });

  app.get('/api/elections/active', isAuthenticated, async (req, res) => {
    try {
      const elections = await storage.getActiveElections();
      res.json(elections);
    } catch (error) {
      console.error("Error fetching active elections:", error);
      res.status(500).json({ message: "Failed to fetch active elections" });
    }
  });

  app.get('/api/elections/:id', isAuthenticated, async (req, res) => {
    try {
      const election = await storage.getElectionById(req.params.id);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }
      res.json(election);
    } catch (error) {
      console.error("Error fetching election:", error);
      res.status(500).json({ message: "Failed to fetch election" });
    }
  });

  app.post('/api/elections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !["administrator", "authority"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertElectionSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const election = await storage.createElection(validatedData);
      
      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "CREATE_ELECTION",
        resource: "election",
        resourceId: election.id,
        details: { electionName: election.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(election);
    } catch (error) {
      console.error("Error creating election:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create election" });
    }
  });

  app.put('/api/elections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !["administrator", "authority"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertElectionSchema.partial().parse(req.body);
      const election = await storage.updateElection(req.params.id, validatedData);
      
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "UPDATE_ELECTION",
        resource: "election",
        resourceId: election.id,
        details: validatedData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(election);
    } catch (error) {
      console.error("Error updating election:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update election" });
    }
  });

  // Candidates endpoints
  app.get('/api/elections/:electionId/candidates', isAuthenticated, async (req, res) => {
    try {
      const candidates = await storage.getCandidatesByElection(req.params.electionId);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.post('/api/elections/:electionId/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !["administrator", "authority"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertCandidateSchema.parse({
        ...req.body,
        electionId: req.params.electionId,
      });

      const candidate = await storage.createCandidate(validatedData);
      
      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "CREATE_CANDIDATE",
        resource: "candidate",
        resourceId: candidate.id,
        details: { candidateName: candidate.name, electionId: req.params.electionId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  // Voting endpoints
  app.post('/api/elections/:electionId/vote', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const electionId = req.params.electionId;
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if election exists and is active
      const election = await storage.getElectionById(electionId);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      if (election.status !== "active") {
        return res.status(400).json({ message: "Election is not active" });
      }

      // Check if user is eligible to vote
      if (!election.eligibleRoles.includes(user.role)) {
        return res.status(403).json({ message: "You are not eligible to vote in this election" });
      }

      // Check if user has already voted
      const hasVoted = await storage.hasUserVoted(electionId, userId);
      if (hasVoted && !election.allowMultipleVotes) {
        return res.status(400).json({ message: "You have already voted in this election" });
      }

      // Validate vote data
      const { candidateId } = req.body;
      if (!candidateId) {
        return res.status(400).json({ message: "Candidate ID is required" });
      }

      // Encrypt vote data
      const voteData = JSON.stringify({ candidateId, timestamp: new Date().toISOString() });
      const encryptedVote = crypto.createHash('sha256').update(voteData).digest('hex');

      const vote = await storage.createVote({
        electionId,
        candidateId,
        encryptedVote,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }, userId);

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "CAST_VOTE",
        resource: "vote",
        resourceId: vote.id,
        details: { electionId, transactionId: vote.transactionId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Create notification
      await storage.createNotification({
        userId,
        title: "Voto Emitido Exitosamente",
        message: `Su voto ha sido registrado en la elección: ${election.name}`,
        type: "success",
        relatedResource: "election",
        relatedResourceId: electionId,
      });

      res.status(201).json({
        message: "Vote cast successfully",
        transactionId: vote.transactionId,
        timestamp: vote.createdAt,
      });
    } catch (error) {
      console.error("Error casting vote:", error);
      res.status(500).json({ message: "Failed to cast vote" });
    }
  });

  // Results endpoints
  app.get('/api/elections/:electionId/results', isAuthenticated, async (req, res) => {
    try {
      const results = await storage.getElectionResults(req.params.electionId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Notifications endpoints
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Profile update endpoint
  app.patch('/api/profile/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, email } = req.body;

      // Validation
      if (!firstName && !lastName && !email) {
        return res.status(400).json({ message: "At least one field is required" });
      }

      if (email && !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Update user profile
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;

      const updatedUser = await storage.updateUser(userId, updateData);

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: "UPDATE_PROFILE",
        resource: "user",
        resourceId: userId,
        details: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Audit logs endpoint
  app.get('/api/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !["administrator", "authority"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "administrator") {
        return res.status(403).json({ message: "Administrator access required" });
      }

      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "administrator") {
        return res.status(403).json({ message: "Administrator access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  app.patch('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== "administrator") {
        return res.status(403).json({ message: "Administrator access required" });
      }

      const { userId } = req.params;
      const updateData = req.body;

      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: currentUserId,
        action: "UPDATE_USER",
        resource: "user",
        resourceId: userId,
        details: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== "administrator") {
        return res.status(403).json({ message: "Administrator access required" });
      }

      const { userId } = req.params;
      
      // Prevent admin from deleting themselves
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId);
      
      // Create audit log
      await storage.createAuditLog({
        userId: currentUserId,
        action: "DELETE_USER",
        resource: "user",
        resourceId: userId,
        details: { deletedUserId: userId },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post('/api/admin/users/:userId/make-admin', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== "administrator") {
        return res.status(403).json({ message: "Administrator access required" });
      }

      const { userId } = req.params;
      
      const updatedUser = await storage.updateUser(userId, { role: "administrator" });
      
      // Create audit log
      await storage.createAuditLog({
        userId: currentUserId,
        action: "GRANT_ADMIN",
        resource: "user",
        resourceId: userId,
        details: { newRole: "administrator" },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error granting admin privileges:", error);
      res.status(500).json({ message: "Failed to grant admin privileges" });
    }
  });

  app.get('/api/admin/audit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "administrator") {
        return res.status(403).json({ message: "Administrator access required" });
      }

      const logs = await storage.getAuditLogs(50);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
