import type { LogLevelType } from 'loglayer'
import { env } from 'std-env'
import { setEnv, setEnvArray } from './helper'

type AppMode = 'development' | 'production' | 'test'

/**
 * Public environment variables, safe to expose to browser.
 * These variables are prefixed with `PUBLIC_` in the actual environment.
 */
export const publicEnv = {
  APP_MODE: setEnv<AppMode>(env.APP_MODE, 'production'),
  APP_LOG_LEVEL: setEnv<LogLevelType>(env.APP_LOG_LEVEL, 'info'),
  PUBLIC_BASE_URL: setEnv(env.PUBLIC_BASE_URL, 'http://localhost:3980'),
  PUBLIC_CORS_ORIGINS: setEnvArray(env.PUBLIC_CORS_ORIGINS, ['*']),
  PUBLIC_JWT_ACCESS_TOKEN_EXPIRY: setEnv(env.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY, 900), // default: 15 minutes
  PUBLIC_JWT_REFRESH_TOKEN_EXPIRY: setEnv(env.PUBLIC_JWT_REFRESH_TOKEN_EXPIRY, 7200) // default: 2 hours
}

/**
 * Protected environment variables (server only) and should not be exposed to browser.
 * These variables are NOT prefixed with `PUBLIC_` in the actual environment.
 * Generate application secret key: `openssl rand -base64 32`
 */
export const protectedEnv = {
  ...publicEnv,
  APP_LOG_TIMESTAMP: setEnv(env.APP_LOG_TIMESTAMP, true),
  APP_LOG_TO_CONSOLE: setEnv(env.APP_LOG_TO_CONSOLE, true),
  APP_LOG_TO_FILE: setEnv(env.APP_LOG_TO_FILE, true),
  GARAGE_ADMIN_API: setEnv(env.GARAGE_ADMIN_API, 'http://localhost:3903'),
  GARAGE_ADMIN_TOKEN: setEnv(env.GARAGE_ADMIN_TOKEN),
  GARAGE_METRICS_TOKEN: setEnv(env.GARAGE_METRICS_TOKEN),
  GARAGE_RPC_SECRET: setEnv(env.GARAGE_RPC_SECRET),
  GARAGE_DEFAULT_ZONE_REDUNDANCY: setEnv(env.GARAGE_DEFAULT_ZONE_REDUNDANCY, 1),
  GARAGE_DEFAULT_CAPACITY: setEnv(env.GARAGE_DEFAULT_CAPACITY, 10_000_000_000), // 10GB
  SECRET_KEY: setEnv(env.SECRET_KEY),
  MAILER_FROM_EMAIL: setEnv(env.MAILER_FROM_EMAIL),
  MAILER_FROM_NAME: setEnv(env.MAILER_FROM_NAME),
  MAILER_SMTP_HOST: setEnv(env.MAILER_SMTP_HOST),
  MAILER_SMTP_PORT: setEnv(env.MAILER_SMTP_PORT, 1025),
  MAILER_SMTP_USERNAME: setEnv(env.MAILER_SMTP_USERNAME),
  MAILER_SMTP_PASSWORD: setEnv(env.MAILER_SMTP_PASSWORD),
  MAILER_SMTP_SECURE: setEnv(env.MAILER_SMTP_SECURE, false)
}
