// app/(admin)/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin Portal', template: '%s | ICT Admin' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  )
}
