import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// JWT Secret - En producción debe estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token válido por 7 días

// Interfaz para el payload del JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Interfaz extendida para Request con usuario
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Genera un hash seguro de una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña en texto plano con su hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT para un usuario
 */
export function generateToken(userId: string, email: string, role: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Middleware de autenticación JWT
 * Valida el token en el header Authorization
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ message: "Token de autenticación requerido" });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(403).json({ message: "Token inválido o expirado" });
      return;
    }

    // Verificar que el usuario existe y está activo
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(403).json({ message: "Usuario no autorizado" });
      return;
    }

    // Adjuntar información del usuario a la request
    req.user = {
      userId: user.id,
      email: user.email || "",
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Error en la autenticación" });
  }
}

/**
 * Middleware para verificar roles específicos
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        message: "No tienes permisos para realizar esta acción" 
      });
      return;
    }

    next();
  };
}

/**
 * Valida la fortaleza de una contraseña
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos una mayúscula" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos una minúscula" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos un número" };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "La contraseña debe contener al menos un carácter especial" };
  }

  return { valid: true };
}

/**
 * Genera un token aleatorio para reset de contraseña
 */
export function generateResetToken(): string {
  return jwt.sign(
    { random: Math.random().toString(36) },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}
