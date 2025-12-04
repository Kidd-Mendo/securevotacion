import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

// Formato personalizado para logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json()
);

// Configurar transports
const transports: winston.transport[] = [
  // Consola para desarrollo
  new winston.transports.Console({
    format,
  }),
];

// En producción, también guardar en archivos
if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  transports,
});

// Función helper para logs de API
export const logAPI = (method: string, path: string, statusCode: number, duration: number) => {
  logger.http(`${method} ${path} ${statusCode} - ${duration}ms`);
};

// Función helper para logs de autenticación
export const logAuth = (action: string, email: string, success: boolean, ip?: string) => {
  const message = `Auth ${action}: ${email} - ${success ? "SUCCESS" : "FAILED"}${ip ? ` from ${ip}` : ""}`;
  if (success) {
    logger.info(message);
  } else {
    logger.warn(message);
  }
};

// Función helper para logs de errores
export const logError = (error: Error, context?: string) => {
  logger.error(`${context ? `[${context}] ` : ""}${error.message}`, {
    stack: error.stack,
  });
};
