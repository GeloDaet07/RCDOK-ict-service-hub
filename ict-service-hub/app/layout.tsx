// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ICT Service Hub — Diocese of Kalookan',
    template: '%s | ICT Service Hub',
  },
  description: 'Internal ICT support and media service request platform for the Diocese of Kalookan.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }} className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
