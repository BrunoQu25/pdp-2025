// Centralized logging utility for better observability

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'api';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
  error?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(logData: LogData): string {
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
      api: '🔌'
    }[logData.level];

    return `${emoji} [${logData.timestamp}] ${logData.context ? `[${logData.context}] ` : ''}${logData.message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: any) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error
    };

    const formattedLog = this.formatLog(logData);

    // Console output with appropriate method
    switch (level) {
      case 'error':
        console.error(formattedLog);
        if (data) console.error('Data:', JSON.stringify(data, null, 2));
        if (error) console.error('Error:', error);
        break;
      case 'warn':
        console.warn(formattedLog);
        if (data && this.isDevelopment) console.warn('Data:', data);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.log(formattedLog);
          if (data) console.log('Data:', data);
        }
        break;
      case 'api':
        console.log(formattedLog);
        if (data && this.isDevelopment) console.log('Data:', data);
        break;
      default:
        console.log(formattedLog);
        if (data && this.isDevelopment) console.log('Data:', data);
    }

    // In production, you could send logs to external service (e.g., Datadog, New Relic, Sentry)
    // this.sendToExternalService(logData);
  }

  // Public API methods
  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, error?: any, data?: any) {
    this.log('error', message, context, data, error);
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data);
  }

  api(method: string, endpoint: string, data?: any) {
    this.log('api', `${method} ${endpoint}`, 'API', data);
  }

  apiSuccess(method: string, endpoint: string, statusCode: number, data?: any) {
    this.log('api', `✓ ${method} ${endpoint} - ${statusCode}`, 'API', data);
  }

  apiError(method: string, endpoint: string, statusCode: number, error: any) {
    this.log('error', `✗ ${method} ${endpoint} - ${statusCode}`, 'API', undefined, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper for API route logging
export const logApiRequest = (request: Request, context?: string) => {
  const url = new URL(request.url);
  logger.api(request.method, url.pathname, { 
    query: Object.fromEntries(url.searchParams),
    context 
  });
};

export const logApiResponse = (request: Request, status: number, data?: any) => {
  const url = new URL(request.url);
  logger.apiSuccess(request.method, url.pathname, status, data);
};

export const logApiError = (request: Request, status: number, error: any) => {
  const url = new URL(request.url);
  logger.apiError(request.method, url.pathname, status, error);
};

