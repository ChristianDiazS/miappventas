import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de niveles de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Formato personalizado para logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transporte para consola en desarrollo
const consoleTransport = new winston.transports.Console();

// Transporte para archivo de errores
const errorFileTransport = new winston.transports.File({
  filename: path.join(__dirname, '../../logs/error.log'),
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.uncolorize(),
    winston.format.printf(
      (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  )
});

// Transporte para archivo combinado
const combinedFileTransport = new winston.transports.File({
  filename: path.join(__dirname, '../../logs/combined.log'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.uncolorize(),
    winston.format.printf(
      (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  )
});

// Logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels: logLevels,
  format,
  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport
  ]
});

// En producción, desactivar colorize en consola para reducir overhead
if (process.env.NODE_ENV === 'production') {
  logger.transports.forEach((transport) => {
    if (transport instanceof winston.transports.Console) {
      transport.format = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.uncolorize(),
        winston.format.printf(
          (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
        )
      );
    }
  });
}

// Stream para morgan (request logging)
export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

export default logger;
