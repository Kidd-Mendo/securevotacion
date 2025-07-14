import {
  users,
  elections,
  candidates,
  votes,
  auditLogs,
  notifications,
  supportTickets,
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
  type SupportTicket,
  type InsertSupportTicket,
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

  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getUserSupportTickets(userId: string): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;

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
    console.log(`DatabaseStorage.getUser: Found user ${user?.email} with role: ${user?.role}`);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await db.select().from(users).where(eq(users.id, userData.id!)).limit(1);

    if (existingUser.length > 0) {
      // Update existing user but preserve role
      const [updatedUser] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
          // Do NOT update role here - preserve existing role
        })
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

  // Support ticket operations
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
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

  async getDashboardStats(): Promise<{
    activeElections: number;
    totalUsers: number;
    votesToday: number;
    onlineUsers: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [activeElectionCount] = await db.select({ count: sql<number>`count(*)` }).from(elections).where(eq(elections.status, "active"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayVoteCount] = await db.select({ count: sql<number>`count(*)` }).from(votes).where(sql`${votes.createdAt} >= ${today}`);
    
    return {
      activeElections: activeElectionCount.count || 0,
      totalUsers: userCount.count || 0,
      votesToday: todayVoteCount.count || 0,
      onlineUsers: Math.floor(Math.random() * 10) + 1, // Mock value
    };
  }
}

// In-memory storage implementation for development
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private elections: Map<string, Election> = new Map();
  private candidates: Map<string, Candidate> = new Map();
  private votes: Map<string, Vote> = new Map();
  private auditLogs: AuditLog[] = [];
  private notifications: Map<string, Notification> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();

  constructor() {
    // Create default admin user
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminUser: User = {
      id: "admin-1",
      email: "admin@school.edu",
      firstName: "System",
      lastName: "Administrator",
      profileImageUrl: null,
      role: "administrator",
      institutionId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    }

    const newUser: User = {
      id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || "student",
      institutionId: userData.institutionId || null,
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getElections(): Promise<Election[]> {
    return Array.from(this.elections.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getElectionById(id: string): Promise<Election | undefined> {
    return this.elections.get(id);
  }

  async createElection(election: InsertElection): Promise<Election> {
    const newElection: Election = {
      id: `election-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...election,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.elections.set(newElection.id, newElection);
    return newElection;
  }

  async updateElection(id: string, updates: Partial<InsertElection>): Promise<Election | undefined> {
    const election = this.elections.get(id);
    if (!election) return undefined;

    const updatedElection = { ...election, ...updates, updatedAt: new Date() };
    this.elections.set(id, updatedElection);
    return updatedElection;
  }

  async deleteElection(id: string): Promise<boolean> {
    return this.elections.delete(id);
  }

  async getActiveElections(): Promise<Election[]> {
    return Array.from(this.elections.values()).filter(e => e.status === 'active');
  }

  async getCandidatesByElection(electionId: string): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(c => c.electionId === electionId);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const newCandidate: Candidate = {
      id: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...candidate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.candidates.set(newCandidate.id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: string, updates: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;

    const updatedCandidate = { ...candidate, ...updates, updatedAt: new Date() };
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }

  async createVote(vote: Omit<InsertVote, "voterHash" | "transactionId">, voterId: string): Promise<Vote> {
    const voterHash = crypto.createHash('sha256').update(voterId + vote.electionId).digest('hex');
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newVote: Vote = {
      id: `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...vote,
      voterHash,
      transactionId,
      createdAt: new Date()
    };
    this.votes.set(newVote.id, newVote);
    return newVote;
  }

  async getVotesByElection(electionId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(v => v.electionId === electionId);
  }

  async hasUserVoted(electionId: string, voterId: string): Promise<boolean> {
    const voterHash = crypto.createHash('sha256').update(voterId + electionId).digest('hex');
    return Array.from(this.votes.values()).some(v => v.electionId === electionId && v.voterHash === voterHash);
  }

  async getElectionResults(electionId: string): Promise<Array<{ candidateId: string; candidateName: string; voteCount: number }>> {
    const electionVotes = await this.getVotesByElection(electionId);
    const candidates = await this.getCandidatesByElection(electionId);
    
    const results = new Map<string, number>();
    electionVotes.forEach(vote => {
      results.set(vote.candidateId, (results.get(vote.candidateId) || 0) + 1);
    });

    return candidates.map(candidate => ({
      candidateId: candidate.id,
      candidateName: candidate.name,
      voteCount: results.get(candidate.id) || 0
    }));
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...log,
      createdAt: new Date()
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  async getDashboardStats(): Promise<{
    activeElections: number;
    totalUsers: number;
    votesToday: number;
    onlineUsers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const votesToday = Array.from(this.votes.values())
      .filter(v => v.createdAt >= today).length;

    return {
      activeElections: Array.from(this.elections.values()).filter(e => e.status === 'active').length,
      totalUsers: this.users.size,
      votesToday,
      onlineUsers: Math.floor(Math.random() * 10) + 1
    };
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
  }

  // Support ticket operations for MemoryStorage
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...ticket,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.supportTickets.set(newTicket.id, newTicket);
    return newTicket;
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values())
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
    };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
}

// Use memory storage to bypass database issues
export const storage = new MemoryStorage();