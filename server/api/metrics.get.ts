import { defineHandler, getQuery } from 'nitro/h3'
import { parseBoolean } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'
import { createErrorResonse } from '../platform/responder'

interface MetricValue {
  labels: Record<string, string>
  value: number
}

interface ParsedMetric {
  type: string
  help: string
  values: MetricValue[]
}

type ParsedMetrics = Record<string, ParsedMetric>

export default defineHandler(async (event) => {
  const { gfetch } = event.context

  try {
    const { raw } = getQuery<{ raw: string | null }>(event)
    const printRaw = parseBoolean(raw ?? null) || false

    const metricsToken = `Bearer ${protectedEnv.GARAGE_METRICS_TOKEN}`
    const resp = await gfetch<string>('/metrics', { headers: { Authorization: metricsToken } })
    const data = parsePrometheusMetrics(resp)
    const response = { status: 'success', message: 'Garage Prometheus Metrics', data }

    return !printRaw ? response : data
  } catch (error) {
    return createErrorResonse(event, error)
  }
})

function parsePrometheusMetrics(rawMetrics: string): ParsedMetrics {
  const lines = rawMetrics.split('\n').filter((line) => line.trim() !== '')
  const metrics: ParsedMetrics = {}

  for (const line of lines) {
    // Parse HELP comments
    const helpMatch = line.match(/^#\s+HELP\s+(\w+)\s+(.+)$/)
    if (helpMatch) {
      const [, name, help] = helpMatch
      if (name && help) {
        if (!metrics[name]) {
          metrics[name] = { type: 'unknown', help: '', values: [] }
        }
        metrics[name].help = help
      }
      continue
    }

    // Parse TYPE comments
    const typeMatch = line.match(/^#\s+TYPE\s+(\w+)\s+(\w+)$/)
    if (typeMatch) {
      const [, name, type] = typeMatch
      if (name && type) {
        if (!metrics[name]) {
          metrics[name] = { type, help: '', values: [] }
        } else {
          metrics[name].type = type
        }
      }
      continue
    }

    // Parse metric lines with labels
    const metricMatch = line.match(/^(\w+)\{([^}]+)\}\s+(.+)$/)
    if (metricMatch) {
      const [, name, labelsStr, value] = metricMatch
      if (name && labelsStr && value) {
        if (!metrics[name]) {
          metrics[name] = { type: 'unknown', help: '', values: [] }
        }

        // Parse labels
        const labels: Record<string, string> = {}
        const labelPairs = labelsStr.split(',')
        for (const pair of labelPairs) {
          const [key, val] = pair.split('=')
          if (key && val) {
            labels[key.trim()] = val.trim().replace(/^"|"$/g, '')
          }
        }

        metrics[name].values.push({
          labels,
          value: Number.parseFloat(value)
        })
      }
      continue
    }

    // Parse metric lines without labels
    const simpleMetricMatch = line.match(/^(\w+)\s+(.+)$/)
    if (simpleMetricMatch) {
      const [, name, value] = simpleMetricMatch
      if (name && value) {
        if (!metrics[name]) {
          metrics[name] = { type: 'unknown', help: '', values: [] }
        }

        metrics[name].values.push({
          labels: {},
          value: Number.parseFloat(value)
        })
      }
    }
  }

  return metrics
}
