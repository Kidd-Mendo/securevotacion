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

  updateUser(userId: string, updateData: Partial<User>): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await db.select().from(users).where(eq(users.id, userData.id!)).limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        },
        )
        .where(eq(users.id, userData.id!))
        .returning();
      return updatedUser;
    } else {
      // Check if this is the first user, make them admin
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      const isFirstUser = userCount[0]?.count === 0;

      // Insert new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: userData.id!,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: isFirstUser ? "administrator" : "student", // First user becomes admin
          isActive: true,
        })
        .returning();
      return newUser;
    }
  }

  async createDefaultAdmin() {
    try {
      // Check if admin already exists
      const adminExists = await db.select().from(users).where(eq(users.role, "administrator")).limit(1);

      if (adminExists.length === 0) {
        // Create default admin user
        const adminId = "admin-default-001";
        const [admin] = await db
          .insert(users)
          .values({
            id: adminId,
            email: "admin@votacion.edu",
            firstName: "Administrador",
            lastName: "Sistema",
            role: "administrator",
            isActive: true,
          })
          .returning();

        console.log("✅ Administrador por defecto creado:");
        console.log("📧 Email: admin@votacion.edu");
        console.log("🔑 ID: admin-default-001");
        console.log("👤 Nombre: Administrador Sistema");

        return admin;
      }
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
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

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(users.createdAt);
    return allUsers;
  }

  async getSystemStats(): Promise<{
    users: {
      total: number;
      administrators: number;
      teachers: number;
      students: number;
      authorities: number;
      active: number;
    };
    elections: {
      total: number;
      active: number;
      upcoming: number;
      completed: number;
    };
    votes: {
      total: number;
    };
    activeElections: number;
    totalVotes: number;
    onlineUsers: number;
  }> {
    const [userStats, electionStats, voteStats] = await Promise.all([
      db.select({
        total: sql<number>`count(*)`,
        administrators: sql<number>`count(*) filter (where role = 'administrator')`,
        teachers: sql<number>`count(*) filter (where role = 'teacher')`,
        students: sql<number>`count(*) filter (where role = 'student')`,
        authorities: sql<number>`count(*) filter (where role = 'authority')`,
        active: sql<number>`count(*) filter (where is_active = true)`
      }).from(users),
      db.select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where status = 'active')`,
        upcoming: sql<number>`count(*) filter (where status = 'upcoming')`,
        completed: sql<number>`count(*) filter (where status = 'completed')`
      }).from(elections),
      db.select({ total: sql<number>`count(*)` }).from(votes)
    ]);

    return {
      users: userStats[0],
      elections: electionStats[0],
      votes: voteStats[0],
      activeElections: electionStats[0]?.active || 0,
      totalVotes: voteStats[0]?.total || 0,
      onlineUsers: Math.floor(Math.random() * 10) + 1 // Mock value
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


  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();