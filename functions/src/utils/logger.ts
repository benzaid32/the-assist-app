import * as functions from 'firebase-functions';

/**
 * Logger utility for standardized, enterprise-grade logging across the application
 * Wraps Firebase Functions logger with additional severity levels and structured logging
 */
class Logger {
  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    functions.logger.debug(message, { ...this.formatLogData(data) });
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    functions.logger.info(message, { ...this.formatLogData(data) });
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    functions.logger.warn(message, { ...this.formatLogData(data) });
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    functions.logger.error(message, { ...this.formatLogData(data) });
  }

  /**
   * Log critical error message
   */
  critical(message: string, data?: any): void {
    functions.logger.error(`[CRITICAL] ${message}`, { 
      severity: 'CRITICAL',
      ...this.formatLogData(data)
    });
  }
  
  /**
   * Format log data to ensure it's serializable and includes timestamps
   */
  private formatLogData(data?: any): Record<string, any> {
    if (!data) return { timestamp: Date.now() };
    
    // Handle Error objects specifically
    if (data instanceof Error) {
      return {
        error: {
          message: data.message,
          name: data.name,
          stack: data.stack,
        },
        timestamp: Date.now()
      };
    }
    
    // Clean up circular references and non-serializable data
    try {
      // Use a safe replacer for JSON.stringify to handle circular references
      const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
        if (key === 'password' || key === 'token' || key === 'secret' || key === 'apiKey') {
          return '[REDACTED]';
        }
        return value;
      }));
      
      return {
        ...safeData,
        timestamp: Date.now()
      };
    } catch (e) {
      return { 
        errorParsingLogData: true,
        timestamp: Date.now()
      };
    }
  }
}

// Export a singleton instance
export const logger = new Logger();
