import * as Sentry from '@sentry/node'

export function initSentry() {
  if (!process.env.SENTRY_DSN) return
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  })
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  }
  console.error(error)
}

// v8+ no longer uses Handlers middleware — auto-instrumentation handles it
export function sentryErrorHandler() {
  return (err: any, req: any, res: any, next: any) => {
    if (process.env.SENTRY_DSN) Sentry.captureException(err)
    next(err)
  }
}
