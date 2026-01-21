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
const isDevelopment = protectedEnv.APP_MODE === 'development'
const isProduction = protectedEnv.APP_MODE === 'production'

const logger = new LogLayer({
  errorSerializer: serializeError,
  consoleDebug: protectedEnv.APP_LOG_TO_CONSOLE,
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  muteContext: false,
  muteMetadata: false,
  transport: [
    // File logging - kept for debugging purposes but with reduced overhead
    // Recommended to disabled in production to reduce I/O overhead unless necessary
    new LogFileRotationTransport({
      level: protectedEnv.APP_LOG_LEVEL,
      enabled: protectedEnv.APP_LOG_TO_FILE,
      filename: join(LOG_DIRECTORY, LOG_FILE_NAME),
      dateFormat: 'YMD',
      frequency: 'daily'
    }),
    // Console logging - enabled only in development for debugging
    // Production disables this to reduce latency overhead
    getSimplePrettyTerminal({
      level: protectedEnv.APP_LOG_LEVEL,
      enabled: isDevelopment && protectedEnv.APP_LOG_TO_CONSOLE,
      viewMode: protectedEnv.APP_LOG_EXPANDED ? 'expanded' : 'inline',
      theme: moonlight,
      runtime: 'node'
    }),
    // Console logging - JSON format for log aggregation
    // Enabled only in production when needed
    new ConsoleTransport({
      level: protectedEnv.APP_LOG_LEVEL,
      enabled: isProduction && protectedEnv.APP_LOG_TO_CONSOLE,
      stringify: true,
      logger: console
    })
  ],
  plugins: [redactionPlugin({ paths: ['password', 'token'] })]
})

export { logger, logger as default }
