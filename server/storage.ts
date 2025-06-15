import {
  users,
  elections,
  candidates,
  votes,
  auditLogs,
  notifications,
  type User,
  type UpsertUser,
  type Election,
  type InsertElection,
  type Candidate,
  type InsertCandidate,
  type Vote,
  type InsertVote,
  type AuditLog,
  type InsertAuditLog,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Election operations
  getElections(): Promise<Election[]>;
  getElectionById(id: string): Promise<Election | undefined>;
  createElection(election: InsertElection): Promise<Election>;
  updateElection(id: string, updates: Partial<InsertElection>): Promise<Election | undefined>;
  deleteElection(id: string): Promise<boolean>;
  getActiveElections(): Promise<Election[]>;

  // Candidate operations
  getCandidatesByElection(electionId: string): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;

  // Vote operations
  createVote(vote: Omit<InsertVote, "voterHash" | "transactionId">, voterId: string): Promise<Vote>;
  getVotesByElection(electionId: string): Promise<Vote[]>;
  hasUserVoted(electionId: string, voterId: string): Promise<boolean>;
  getElectionResults(electionId: string): Promise<Array<{ candidateId: string; candidateName: string; voteCount: number }>>;

  // Audit operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // Statistics
  getDashboardStats(): Promise<{
    activeElections: number;
    totalUsers: number;
    votesToday: number;
    onlineUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Election operations
  async getElections(): Promise<Election[]> {
    return await db.select().from(elections).orderBy(desc(elections.createdAt));
  }

  async getElectionById(id: string): Promise<Election | undefined> {
    const [election] = await db.select().from(elections).where(eq(elections.id, id));
    return election;
  }

  async createElection(election: InsertElection): Promise<Election> {
    const [created] = await db.insert(elections).values(election).returning();
    return created;
  }

  async updateElection(id: string, updates: Partial<InsertElection>): Promise<Election | undefined> {
    const [updated] = await db
      .update(elections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(elections.id, id))
      .returning();
    return updated;
  }

  async deleteElection(id: string): Promise<boolean> {
    const result = await db.delete(elections).where(eq(elections.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveElections(): Promise<Election[]> {
    const now = new Date();
    return await db
      .select()
      .from(elections)
      .where(
        and(
          eq(elections.status, "active"),
          sql`${elections.startDate} <= ${now}`,
          sql`${elections.endDate} >= ${now}`
        )
      )
      .orderBy(elections.startDate);
  }

  // Candidate operations
  async getCandidatesByElection(electionId: string): Promise<Candidate[]> {
    return await db
      .select()
      .from(candidates)
      .where(eq(candidates.electionId, electionId))
      .orderBy(candidates.position);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [created] = await db.insert(candidates).values(candidate).returning();
    return created;
  }

  async updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updated] = await db
      .update(candidates)
      .set(updates)
      .where(eq(candidates.id, id))
      .returning();
    return updated;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const result = await db.delete(candidates).where(eq(candidates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Vote operations
  async createVote(vote: Omit<InsertVote, "voterHash" | "transactionId">, voterId: string): Promise<Vote> {
    const voterHash = crypto.createHash('sha256').update(voterId + vote.electionId).digest('hex');
    const transactionId = `VT-${new Date().getFullYear()}-${Date.now()}`;

    const [created] = await db
      .insert(votes)
      .values({
        ...vote,
        voterHash,
        transactionId,
      })
      .returning();
    return created;
  }

  async getVotesByElection(electionId: string): Promise<Vote[]> {
    return await db
      .select()
      .from(votes)
      .where(eq(votes.electionId, electionId))
      .orderBy(desc(votes.createdAt));
  }

  async hasUserVoted(electionId: string, voterId: string): Promise<boolean> {
    const voterHash = crypto.createHash('sha256').update(voterId + electionId).digest('hex');
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.electionId, electionId), eq(votes.voterHash, voterHash)));
    return !!vote;
  }

  async getElectionResults(electionId: string): Promise<Array<{ candidateId: string; candidateName: string; voteCount: number }>> {
    const results = await db
      .select({
        candidateId: votes.candidateId,
        candidateName: candidates.name,
        voteCount: count(votes.id),
      })
      .from(votes)
      .innerJoin(candidates, eq(votes.candidateId, candidates.id))
      .where(eq(votes.electionId, electionId))
      .groupBy(votes.candidateId, candidates.name)
      .orderBy(desc(count(votes.id)));

    return results.map(result => ({
      candidateId: result.candidateId,
      candidateName: result.candidateName,
      voteCount: Number(result.voteCount),
    }));
  }

  // Audit operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Statistics
  async getDashboardStats(): Promise<{
    activeElections: number;
    totalUsers: number;
    votesToday: number;
    onlineUsers: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [activeElectionsResult] = await db
      .select({ count: count() })
      .from(elections)
      .where(eq(elections.status, "active"));

    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const [votesTodayResult] = await db
      .select({ count: count() })
      .from(votes)
      .where(sql`${votes.createdAt} >= ${today}`);

    return {
      activeElections: Number(activeElectionsResult.count),
      totalUsers: Number(totalUsersResult.count),
      votesToday: Number(votesTodayResult.count),
      onlineUsers: 0, // This would require session tracking
    };
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return this.getUser(userId);
  }
}

export const storage = new DatabaseStorage();