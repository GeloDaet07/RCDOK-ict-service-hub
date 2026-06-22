// app/(user)/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'My Portal', template: '%s | ICT Service Hub' },
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  )
}
