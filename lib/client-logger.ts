// Client-side logging utility
'use client';

type ClientLogLevel = 'info' | 'warn' | 'error' | 'debug' | 'action';

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: ClientLogLevel, message: string, context?: string, data?: any) {
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
      action: '👆'
    }[level];

    const timestamp = new Date().toLocaleTimeString();
    const formattedLog = `${emoji} [${timestamp}] ${context ? `[${context}] ` : ''}${message}`;

    switch (level) {
      case 'error':
        console.error(formattedLog);
        if (data) console.error('Data:', data);
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
      default:
        console.log(formattedLog);
        if (data && this.isDevelopment) console.log('Data:', data);
    }
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any) {
    this.log('error', message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data);
  }

  action(action: string, context?: string, data?: any) {
    this.log('action', action, context, data);
  }

  // API call logging
  apiCall(method: string, endpoint: string, data?: any) {
    this.log('info', `📡 ${method} ${endpoint}`, 'API', data);
  }

  apiSuccess(method: string, endpoint: string, data?: any) {
    this.log('info', `✅ ${method} ${endpoint}`, 'API', data);
  }

  apiError(method: string, endpoint: string, error: any) {
    this.log('error', `❌ ${method} ${endpoint}`, 'API', error);
  }
}

export const clientLogger = new ClientLogger();

