import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { authenticateToken, hashPassword, comparePassword, generateToken, validatePassword, generateResetToken, type AuthRequest } from "./auth";
import { insertElectionSchema, insertCandidateSchema, insertVoteSchema, insertSupportTicketSchema } from "@shared/schema";
import crypto from "crypto";
import { z } from "zod";
import { logger, logAuth, logError } from "./logger";

// Rate limiters para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 requests por ventana
  message: "Demasiados intentos desde esta IP, por favor intenta de nuevo en 15 minutos",
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde",
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Aplicar rate limiter general a todas las rutas API
  app.use('/api', generalLimiter);
  
  // Auth routes - Registro de usuarios
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validar datos requeridos
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
      }

      // Validar fortaleza de contraseña
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        logAuth("REGISTER", email, false, req.ip);
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      // Hashear contraseña
      const hashedPassword = await hashPassword(password);

      // Crear usuario
      const newUser = await storage.createUser({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        firstName: firstName || "",
        lastName: lastName || "",
        role: role || "student",
        isActive: true,
      });

      // Generar token JWT
      const token = generateToken(newUser.id, newUser.email!, newUser.role);

      // Logging
      logAuth("REGISTER", email, true, req.ip);

      // Crear log de auditoría
      await storage.createAuditLog({
        userId: newUser.id,
        action: "USER_REGISTERED",
        resource: "user",
        resourceId: newUser.id,
        details: { email: newUser.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
      });
    } catch (error) {
      logError(error as Error, "Register");
      console.error("Error en registro:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });

  // Auth routes - Login
  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      // Buscar usuario por email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logAuth("LOGIN", email, false, req.ip);
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        logAuth("LOGIN", email, false, req.ip);
        return res.status(403).json({ message: "Usuario inactivo. Contacte al administrador." });
      }

      // Verificar contraseña
      const isValidPassword = await comparePassword(password, user.password!);
      if (!isValidPassword) {
        logAuth("LOGIN", email, false, req.ip);
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Generar token JWT
      const token = generateToken(user.id, user.email!, user.role);

      // Logging
      logAuth("LOGIN", email, true, req.ip);

      // Crear log de auditoría
      await storage.createAuditLog({
        userId: user.id,
        action: "USER_LOGIN",
        resource: "user",
        resourceId: user.id,
        details: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        message: "Login exitoso",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (error) {
      logError(error as Error, "Login");
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  });

  // Auth routes - Solicitar reset de contraseña
  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email es requerido" });
      }

      const user = await storage.getUserByEmail(email);
      
      // Por seguridad, siempre retornar el mismo mensaje
      const message = "Si el email existe, recibirás instrucciones para restablecer tu contraseña";
      
      if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return res.json({ message });
      }

      // Generar token de reset
      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hora

      // Guardar token en la base de datos
      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      // TODO: Enviar email con el token
      // En producción, usar servicio de email como SendGrid, AWS SES, etc.
      logger.info(`Password reset token generated for: ${email}`);
      logger.debug(`Reset token: ${resetToken}`); // Solo en desarrollo

      res.json({ message });
    } catch (error) {
      logError(error as Error, "Forgot Password");
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  });

  // Auth routes - Resetear contraseña con token
  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
      }

      // Validar fortaleza de contraseña
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Buscar usuario con el token válido
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      // Hashear nueva contraseña
      const hashedPassword = await hashPassword(newPassword);

      // Actualizar contraseña y limpiar token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      logger.info(`Password successfully reset for user: ${user.email}`);

      // Crear log de auditoría
      await storage.createAuditLog({
        userId: user.id,
        action: "PASSWORD_RESET",
        resource: "user",
        resourceId: user.id,
        details: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ message: "Contraseña restablecida exitosamente" });
    } catch (error) {
      logError(error as Error, "Reset Password");
      res.status(500).json({ message: "Error al restablecer la contraseña" });
    }
  });

  // Auth routes - Verificar token y obtener usuario actual
  app.get('/api/auth/user', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Set cache headers to prevent caching issues
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        institutionId: user.institutionId,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Elections endpoints
  app.get('/api/elections', authenticateToken, async (req, res) => {
    try {
      const elections = await storage.getElections();
      res.json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ message: "Failed to fetch elections" });
    }
  });

  app.get('/api/elections/active', authenticateToken, async (req, res) => {
    try {
      const elections = await storage.getActiveElections();
      res.json(elections);
    } catch (error) {
      console.error("Error fetching active elections:", error);
      res.status(500).json({ message: "Failed to fetch active elections" });
    }
  });

  app.get('/api/elections/:id', authenticateToken, async (req, res) => {
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

  app.post('/api/elections', authenticateToken, async (req: AuthRequest, res) => {
    try {
      console.log("POST /api/elections - Request body:", req.body);
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);
      console.log("User creating election:", user?.email, "Role:", user?.role);
      
      if (!user || !["administrator", "authority"].includes(user.role)) {
        console.log("Insufficient permissions for user:", user?.email);
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Convert date strings to Date objects
      const dataWithDates = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        createdBy: userId,
      };
      
      const validatedData = insertElectionSchema.parse(dataWithDates);
      console.log("Validated election data:", validatedData);

      const election = await storage.createElection(validatedData);
      console.log("Election created:", election);
      
      // Create candidates if provided
      if (req.body.candidates && Array.isArray(req.body.candidates)) {
        console.log("Creating candidates:", req.body.candidates);
        for (const candidateData of req.body.candidates) {
          if (candidateData.name && candidateData.name.trim()) {
            await storage.createCandidate({
              electionId: election.id,
              name: candidateData.name,
              description: candidateData.description || "",
              party: candidateData.party || "",
              imageUrl: candidateData.imageUrl || "",
            });
          }
        }
      }
      
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

  app.put('/api/elections/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !["administrator", "authority"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Convert date strings to Date objects if present
      const dataWithDates = {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
      };
      
      const validatedData = insertElectionSchema.partial().parse(dataWithDates);
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
  app.get('/api/elections/:electionId/candidates', authenticateToken, async (req, res) => {
    try {
      const candidates = await storage.getCandidatesByElection(req.params.electionId);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.post('/api/elections/:electionId/candidates', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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
  app.post('/api/elections/:electionId/vote', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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
  app.get('/api/elections/:electionId/results', authenticateToken, async (req, res) => {
    try {
      const results = await storage.getElectionResults(req.params.electionId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Notifications endpoints
  app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Profile update endpoint
  app.patch('/api/profile/update', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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

      // Set cache headers to prevent caching issues
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
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
  app.get('/api/audit-logs', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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
  app.get('/api/admin/users', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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

  app.get('/api/admin/stats', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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

  app.patch('/api/admin/users/:userId', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.user!.userId;
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

  app.delete('/api/admin/users/:userId', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.user!.userId;
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

  app.post('/api/admin/users/:userId/make-admin', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.user!.userId;
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

  app.get('/api/admin/audit', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
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

  // Support tickets endpoints
  app.get('/api/support-tickets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);
      
      let tickets;
      if (user && ["administrator", "authority"].includes(user.role)) {
        // Administrators and authorities can see all tickets
        tickets = await storage.getAllSupportTickets();
      } else {
        // Regular users only see their own tickets
        tickets = await storage.getUserSupportTickets(userId);
      }
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post('/api/support-tickets', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const validatedData = insertSupportTicketSchema.parse({
        ...req.body,
        userId,
      });
      
      const ticket = await storage.createSupportTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ticket data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.patch('/api/support-tickets/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const user = await storage.getUser(userId);
      
      // Only administrators and authorities can update tickets
      if (!user || !["administrator", "authority"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const updates = req.body;
      const updatedTicket = await storage.updateSupportTicket(req.params.id, updates);
      
      if (!updatedTicket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
