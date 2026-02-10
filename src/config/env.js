

// Environment variable validation schema
const ENV_SCHEMA = {
  // Required variables
  required: [
    'VITE_API_BASE_URL'
  ],
  // Optional variables with defaults
  optional: {
    VITE_API_TIMEOUT: 10000,
    VITE_APP_ENV: 'development',
    VITE_APP_NAME: 'Hiring System',
    VITE_APP_VERSION: '1.0.0',
    VITE_ENABLE_DEV_TOOLS: true,
    VITE_ENABLE_API_LOGGING: false,
    VITE_TOKEN_STORAGE_KEY: 'hiring_system_token',
    VITE_SESSION_TIMEOUT: 60
  }
};

/**
 * Get environment variable with type conversion and validation
 */
const getEnvVar = (key, defaultValue = null, type = 'string') => {
  const value = import.meta.env[key] || defaultValue;
  
  if (value === null) return null;
  
  switch (type) {
    case 'number':
      return parseInt(value, 10);
    case 'boolean':
      return value === 'true' || value === true;
    case 'string':
    default:
      return value;
  }
};

/**
 * Application Configuration Object
 */
export const config = {
  // API Configuration
  api: {
    baseURL: getEnvVar('VITE_API_BASE_URL'),
    timeout: getEnvVar('VITE_API_TIMEOUT', ENV_SCHEMA.optional.VITE_API_TIMEOUT, 'number')
  },
  
  // Application Configuration
  app: {
    env: getEnvVar('VITE_APP_ENV', ENV_SCHEMA.optional.VITE_APP_ENV),
    name: getEnvVar('VITE_APP_NAME', ENV_SCHEMA.optional.VITE_APP_NAME),
    version: getEnvVar('VITE_APP_VERSION', ENV_SCHEMA.optional.VITE_APP_VERSION),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE
  },
  
  // Feature Flags
  features: {
    devTools: getEnvVar('VITE_ENABLE_DEV_TOOLS', ENV_SCHEMA.optional.VITE_ENABLE_DEV_TOOLS, 'boolean'),
    apiLogging: getEnvVar('VITE_ENABLE_API_LOGGING', ENV_SCHEMA.optional.VITE_ENABLE_API_LOGGING, 'boolean')
  },
  
  // Security Configuration
  security: {
    tokenStorageKey: getEnvVar('VITE_TOKEN_STORAGE_KEY', ENV_SCHEMA.optional.VITE_TOKEN_STORAGE_KEY),
    sessionTimeout: getEnvVar('VITE_SESSION_TIMEOUT', ENV_SCHEMA.optional.VITE_SESSION_TIMEOUT, 'number')
  }
};

/**
 * Validate configuration on startup
 */
const validateConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Check required variables
  ENV_SCHEMA.required.forEach(key => {
    if (!import.meta.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });
  
  // Validate API URL format
  if (config.api.baseURL && !config.api.baseURL.match(/^https?:\/\/.+/)) {
    errors.push('VITE_API_BASE_URL must be a valid HTTP/HTTPS URL');
  }
  
  // Development warnings
  if (config.app.isDevelopment) {

  
  // Production validations
  if (config.app.isProduction) {
    if (config.features.devTools) {
      warnings.push('Development tools are enabled in production');
    }
    if (config.security.tokenStorageKey === ENV_SCHEMA.optional.VITE_TOKEN_STORAGE_KEY) {
      errors.push('Must change VITE_TOKEN_STORAGE_KEY for production');
    }
  }
  
  return { errors, warnings };
};

/**
 * Initialize configuration and validate
 */
const initializeConfig = () => {
  const { errors, warnings } = validateConfig();
  
  // Log errors and warnings
  if (errors.length > 0) {
    console.error(' Configuration Errors:');
    errors.forEach(error => console.error(`  • ${error}`));
    throw new Error('Invalid configuration. Please check your .env file.');
  }
  
  if (warnings.length > 0 && config.app.isDevelopment) {
    console.warn(' Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
  
  // Log configuration in development
  if (config.app.isDevelopment && config.features.devTools) {
    console.log('🔧 Application Configuration:', {
      API: `${config.api.baseURL} (timeout: ${config.api.timeout}ms)`,
      Environment: config.app.env,
      Version: config.app.version,
      Features: config.features,
      Mode: config.app.mode
    });
  }
};

// Initialize configuration on module load
initializeConfig();

export default config;