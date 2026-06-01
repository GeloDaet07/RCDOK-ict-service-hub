'use client'
// components/admin/UserActions.tsx
import { useState } from 'react'
import type { UserRole } from '@/types/database'

interface Props {
  userId:          string
  currentRole:     UserRole
  isSuspended:     boolean
  currentUserRole: string
}

export function AdminUserActions({ userId, currentRole, isSuspended, currentUserRole }: Props) {
  const [loading, setLoading] = useState(false)

  const canChangeRole    = ['ict_admin', 'super_admin'].includes(currentUserRole)
  const canSuspend       = ['ict_admin', 'super_admin'].includes(currentUserRole)
  const protectedRoles   = currentUserRole === 'super_admin' ? [] : ['super_admin', 'ict_admin']
  const isProtected      = protectedRoles.includes(currentRole)

  const handleRoleChange = async (newRole: UserRole) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return
    setLoading(true)
    await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    setLoading(false)
    window.location.reload()
  }

  const handleSuspend = async () => {
    const action = isSuspended ? 'reactivate' : 'suspend'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    setLoading(true)
    await fetch('/api/admin/users/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, suspend: !isSuspended }),
    })
    setLoading(false)
    window.location.reload()
  }

  if (isProtected && currentUserRole !== 'super_admin') {
    return <span className="text-xs text-slate-400 italic">Protected</span>
  }

  return (
    <div className="flex items-center gap-2">
      {canChangeRole && (
        <select
          disabled={loading}
          defaultValue={currentRole}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          className="h-8 px-2 rounded border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
        >
          <option value="requester">Requester</option>
          <option value="ict_staff">ICT Staff</option>
          <option value="ict_admin">ICT Admin</option>
          {currentUserRole === 'super_admin' && <option value="super_admin">Super Admin</option>}
        </select>
      )}
      {canSuspend && (
        <button
          onClick={handleSuspend}
          disabled={loading}
          className={`h-8 px-2 rounded text-xs font-semibold transition-colors ${
            isSuspended
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {isSuspended ? 'Reactivate' : 'Suspend'}
        </button>
      )}
    </div>
  )
}
