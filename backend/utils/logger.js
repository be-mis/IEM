// utils/logger.js - Centralized logging utility
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  info: (...args) => {
    if (isDevelopment) {
      console.log('ℹ️ [INFO]', new Date().toISOString(), ...args);
    }
  },
  
  error: (...args) => {
    console.error('❌ [ERROR]', new Date().toISOString(), ...args);
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('⚠️ [WARN]', new Date().toISOString(), ...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment && process.env.DEBUG === 'true') {
      console.log('🐛 [DEBUG]', new Date().toISOString(), ...args);
    }
  },
  
  success: (...args) => {
    if (isDevelopment) {
      console.log('✅ [SUCCESS]', new Date().toISOString(), ...args);
    }
  }
};

module.exports = logger;
