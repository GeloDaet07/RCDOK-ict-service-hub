// components/admin/UsageMonitor.tsx
// Free-tier usage monitoring for Supabase + Vercel
// Keeps track of DB usage to avoid hitting limits

import { createSupabaseServerClient } from '@/lib/supabase/server'

const FREE_TIER_LIMITS = {
  DB_ROWS_WARN: 400_000,   // Supabase free = 500MB ~ ~500k small rows
  TICKETS_WARN: 10_000,    // Arbitrary soft limit for our app
  USERS_WARN: 500,
}

interface UsageBarProps {
  label: string
  current: number
  max: number
  unit?: string
  warnAt?: number
}

function UsageBar({ label, current, max, unit = '', warnAt }: UsageBarProps) {
  const pct = Math.min((current / max) * 100, 100)
  const isWarning = warnAt ? current >= warnAt : pct >= 80
  const isDanger = pct >= 95

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-500'}`}>
          {current.toLocaleString()}{unit} / {max.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2.5 bg-liturgical-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-green-500'
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
      {isWarning && (
        <p className={`text-xs mt-1 ${isDanger ? 'text-red-600' : 'text-amber-600'}`}>
          {isDanger ? '⚠️ Approaching limit — consider cleanup.' : '⚡ Usage is elevated.'}
        </p>
      )}
    </div>
  )
}

export async function AdminUsageMonitor() {
  const supabase = await createSupabaseServerClient()

  const [tickets, users, comments, notifs, auditLogs] = await Promise.all([
    supabase.from('tickets').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('notifications').select('id', { count: 'exact', head: true }),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
  ])

  const totalRows =
    (tickets.count || 0) +
    (users.count || 0) +
    (comments.count || 0) +
    (notifs.count || 0) +
    (auditLogs.count || 0)

  const tips = [
    (notifs.count || 0) > 5000 && 'Consider running the notification cleanup function.',
    (auditLogs.count || 0) > 20000 && 'Audit logs are large — consider archiving old entries.',
    (tickets.count || 0) > 5000 && 'High ticket count — closed tickets may be archived.',
  ].filter(Boolean)

  return (
    <div className="bg-white rounded-card border border-liturgical-muted shadow-card">
      <div className="px-6 py-4 border-b border-liturgical-muted flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-950">Free-Tier Usage</h2>
          <p className="text-xs text-slate-500 mt-0.5">Supabase Free Plan monitoring</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
          ✓ Free Tier
        </span>
      </div>
      <div className="p-6 space-y-5">
        <UsageBar
          label="Total DB Rows (est.)"
          current={totalRows}
          max={500_000}
          warnAt={400_000}
        />
        <UsageBar
          label="Tickets"
          current={tickets.count || 0}
          max={FREE_TIER_LIMITS.TICKETS_WARN * 2}
          warnAt={FREE_TIER_LIMITS.TICKETS_WARN}
        />
        <UsageBar
          label="Registered Users"
          current={users.count || 0}
          max={FREE_TIER_LIMITS.USERS_WARN * 2}
          warnAt={FREE_TIER_LIMITS.USERS_WARN}
        />
        <UsageBar
          label="Comments"
          current={comments.count || 0}
          max={50_000}
        />
        <UsageBar
          label="Notifications (unarchived)"
          current={notifs.count || 0}
          max={10_000}
          warnAt={8_000}
        />
        <UsageBar
          label="Audit Log Entries"
          current={auditLogs.count || 0}
          max={50_000}
          warnAt={40_000}
        />

        {/* Row breakdown */}
        <div className="pt-3 border-t border-liturgical-muted">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Row Breakdown</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tickets', count: tickets.count || 0 },
              { label: 'Users', count: users.count || 0 },
              { label: 'Comments', count: comments.count || 0 },
              { label: 'Notifications', count: notifs.count || 0 },
              { label: 'Audit Logs', count: auditLogs.count || 0 },
              { label: 'Total', count: totalRows },
            ].map(({ label, count }) => (
              <div key={label} className={`flex justify-between text-xs px-3 py-1.5 rounded ${label === 'Total' ? 'bg-navy-950 text-white font-bold col-span-2' : 'bg-liturgical-cream text-slate-600'}`}>
                <span>{label}</span>
                <span className="font-mono font-bold">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization tips */}
        {tips.length > 0 && (
          <div className="pt-3 border-t border-liturgical-muted">
            <p className="text-xs font-bold text-amber-700 mb-2">⚡ Optimization Tips</p>
            {tips.map((tip, i) => (
              <p key={i} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-1">
                {tip as string}
              </p>
            ))}
          </div>
        )}

        <div className="text-xs text-slate-400 text-center pt-2">
          No file storage used · External archive links only
        </div>
      </div>
    </div>
  )
}
