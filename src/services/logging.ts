/**
 * Logging service for The Assist App
 * Provides centralized logging with different severity levels
 * In production, this would integrate with a service like Firebase Analytics, Sentry, or LogRocket
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Log entry structure
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  context?: Record<string, any>;
}

// Current environment
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Base logging function
 * @param level Log level
 * @param message Log message
 * @param data Additional data to log
 * @param userId Current user ID (if available)
 * @param context Additional context information
 */
const log = (
  level: LogLevel,
  message: string,
  data?: any,
  userId?: string,
  context?: Record<string, any>
): void => {
  // Create log entry
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    userId,
    sessionId: getSessionId(),
    context,
  };

  // In production, send logs to a proper logging service
  if (isProduction) {
    // TODO: Integrate with a production logging service like Firebase Analytics, Sentry, or LogRocket
    // This is where you would send the log entry to your logging service
  }

  // Always log to console in development, selectively in production
  switch (level) {
    case LogLevel.DEBUG:
      if (!isProduction) console.debug('[DEBUG]', message, entry);
      break;
    case LogLevel.INFO:
      if (!isProduction) console.info('[INFO]', message, entry);
      break;
    case LogLevel.WARN:
      console.warn('[WARN]', message, entry);
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(`[${level.toUpperCase()}]`, message, entry);
      break;
    default:
      console.log(message, entry);
  }
};

/**
 * Generate or retrieve a session ID for tracking user sessions
 */
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

/**
 * Log debug message
 * @param message Log message
 * @param data Additional data
 * @param userId Current user ID (if available)
 * @param context Additional context
 */
export const logDebug = (
  message: string,
  data?: any,
  userId?: string,
  context?: Record<string, any>
): void => {
  log(LogLevel.DEBUG, message, data, userId, context);
};

/**
 * Log info message
 * @param message Log message
 * @param data Additional data
 * @param userId Current user ID (if available)
 * @param context Additional context
 */
export const logInfo = (
  message: string,
  data?: any,
  userId?: string,
  context?: Record<string, any>
): void => {
  log(LogLevel.INFO, message, data, userId, context);
};

/**
 * Log warning message
 * @param message Log message
 * @param data Additional data
 * @param userId Current user ID (if available)
 * @param context Additional context
 */
export const logWarning = (
  message: string,
  data?: any,
  userId?: string,
  context?: Record<string, any>
): void => {
  log(LogLevel.WARN, message, data, userId, context);
};

/**
 * Log error message
 * @param message Log message
 * @param error Error object
 * @param userId Current user ID (if available)
 * @param context Additional context
 */
export const logError = (
  message: string,
  error: unknown,
  userId?: string,
  context?: Record<string, any>
): void => {
  // Extract error details
  const errorData = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined,
    raw: error,
  };
  
  log(LogLevel.ERROR, message, errorData, userId, context);
};

/**
 * Log critical error message
 * @param message Log message
 * @param error Error object
 * @param userId Current user ID (if available)
 * @param context Additional context
 */
export const logCritical = (
  message: string,
  error: unknown,
  userId?: string,
  context?: Record<string, any>
): void => {
  // Extract error details
  const errorData = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined,
    raw: error,
  };
  
  log(LogLevel.CRITICAL, message, errorData, userId, context);
};
