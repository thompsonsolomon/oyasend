import * as Sentry from '@sentry/react'

export function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    console.warn('Sentry DSN is not configured.')
    return
  }

  Sentry.init({
    dsn,

    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    tracesSampleRate: 0.1,

    environment: import.meta.env.MODE,
  })
}