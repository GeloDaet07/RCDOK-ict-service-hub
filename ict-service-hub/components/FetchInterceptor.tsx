'use client'

import { useEffect } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export function FetchInterceptor() {
  useEffect(() => {
    // We only want to intercept fetch in the browser
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch
    
    // Counter to handle concurrent requests
    let activeRequests = 0

    const startProgress = () => {
      if (activeRequests === 0) {
        NProgress.start()
      }
      activeRequests++
    }

    const stopProgress = () => {
      activeRequests = Math.max(0, activeRequests - 1)
      if (activeRequests === 0) {
        NProgress.done()
      }
    }

    window.fetch = async function (...args) {
      const requestInfo = args[0]
      let url = ''

      if (typeof requestInfo === 'string') {
        url = requestInfo
      } else if (requestInfo instanceof URL) {
        url = requestInfo.toString()
      } else if (requestInfo instanceof Request) {
        url = requestInfo.url
      }

      const isNextInternal = url.includes('?_rsc=') || url.includes('.next/')
      const isMyApi = url.includes('/api/') || url.includes(process.env.NEXT_PUBLIC_API_URL || '')
      const shouldTrack = !isNextInternal && isMyApi

      if (shouldTrack) startProgress()

      try {
        return await originalFetch.apply(this, args)
      } finally {
        if (shouldTrack) stopProgress()
      }
    }

    return () => {
      // Restore original fetch on unmount
      window.fetch = originalFetch
    }
  }, [])

  return null
}
