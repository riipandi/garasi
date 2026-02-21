import { redactionPlugin } from '@loglayer/plugin-redaction'
import { LogFileRotationTransport } from '@loglayer/transport-log-file-rotation'
import { getSimplePrettyTerminal, moonlight } from '@loglayer/transport-simple-pretty-terminal'
import { ConsoleTransport, LogLayer } from 'loglayer'
import { join } from 'path'
import { serializeError } from 'serialize-error'
import pkg from '~/package.json' with { type: 'json' }
import { protectedEnv } from '~/shared/envars'

// Define the directory and file name for log storage
const LOG_FILE_NAME = `${pkg.name}-${protectedEnv.APP_MODE}-%DATE%.log`
const LOG_DIRECTORY = join(process.cwd(), `storage/logs`)

// Define the application mode based on envar values
const logEnable = protectedEnv.APP_LOG_LEVEL !== 'none'
const isProduction = logEnable && protectedEnv.APP_MODE === 'production'
const isDevelopment = logEnable && protectedEnv.APP_MODE === 'development'
const logLevel = protectedEnv.APP_LOG_LEVEL === 'none' ? 'info' : protectedEnv.APP_LOG_LEVEL

const logger = new LogLayer({
  enabled: logEnable,
  consoleDebug: protectedEnv.APP_LOG_TRANSPORT === 'console',
  contextFieldName: 'ctx',
  metadataFieldName: 'meta',
  errorFieldName: 'error',
  muteContext: isDevelopment,
  muteMetadata: false,
  errorSerializer: serializeError,
  transport: [
    // File logging - kept for debugging purposes but with reduced overhead
    // Recommended to disabled in production to reduce I/O overhead unless necessary
    new LogFileRotationTransport({
      level: logLevel,
      enabled: logEnable && protectedEnv.APP_LOG_TRANSPORT === 'file',
      filename: join(LOG_DIRECTORY, LOG_FILE_NAME),
      dateFormat: 'YMD',
      frequency: 'daily'
    }),
    // Console logging - enabled only in development for debugging
    // Production disables this to reduce latency overhead
    getSimplePrettyTerminal({
      level: logLevel,
      enabled: isDevelopment && protectedEnv.APP_LOG_TRANSPORT === 'pretty-console',
      viewMode: protectedEnv.APP_LOG_EXPANDED ? 'expanded' : 'inline',
      theme: moonlight,
      runtime: 'node'
    }),
    // Console logging - JSON format for log aggregation
    // Enabled only in production when needed
    new ConsoleTransport({
      level: logLevel,
      enabled: isProduction && protectedEnv.APP_LOG_TRANSPORT === 'console',
      stringify: true,
      logger: console
    })
  ],
  plugins: [
    redactionPlugin({
      paths: ['password', 'token', 'secretAccessKey', '*.password', '*.token', '*.secretAccessKey']
    })
  ]
})

function shouldIgnorePath(pathname: string): boolean {
  const ignoredPaths = ['/favicon.ico', '/favicon.png', '/favicon.svg', '/robots.txt']
  const ignoredPrefixes = ['/api/healthz', '/metrics', '/traces', '/assets', '/images', '/__tsd']
  return (
    pathname.startsWith('/.well-known') ||
    ignoredPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    ignoredPaths.includes(pathname)
  )
}

export { logger, shouldIgnorePath }
