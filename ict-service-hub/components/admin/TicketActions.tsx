'use client'
// components/admin/TicketActions.tsx
import { useState } from 'react'
import { updateTicket, addComment } from '@/lib/actions/tickets'
import { Button, Alert } from '@/components/ui'
import type { TicketStatus, TicketPriority } from '@/types/database'
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from '@/types/database'

interface Props {
  ticketId:          string
  currentStatus:     TicketStatus
  currentPriority:   TicketPriority
  currentAssignedTo: string | null
  currentUserId:     string
  staff: { id: string; full_name: string; role: string }[]
}

export function AdminTicketActions({
  ticketId, currentStatus, currentPriority, currentAssignedTo, currentUserId, staff,
}: Props) {
  const [status,     setStatus]     = useState<TicketStatus>(currentStatus)
  const [priority,   setPriority]   = useState<TicketPriority>(currentPriority)
  const [assignedTo, setAssignedTo] = useState<string>(currentAssignedTo || '')
  const [resolution, setResolution] = useState('')
  const [comment,    setComment]    = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [posting,    setPosting]    = useState(false)
  const [message,    setMessage]    = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpdate = async () => {
    setSaving(true)
    setMessage(null)
    const result = await updateTicket(ticketId, {
      status,
      priority,
      assigned_to: assignedTo || null,
      resolution_notes: resolution || undefined,
    })
    setSaving(false)
    setMessage(result.success
      ? { type: 'success', text: 'Ticket updated successfully.' }
      : { type: 'error',   text: result.error })
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    setPosting(true)
    const result = await addComment({ ticket_id: ticketId, body: comment, is_internal: isInternal })
    setPosting(false)
    if (result.success) {
      setComment('')
      setMessage({ type: 'success', text: 'Comment posted.' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  const handleAssignToMe = () => setAssignedTo(currentUserId)

  return (
    <div className="space-y-4">
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} onDismiss={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Update ticket */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 mb-4">Update Ticket</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Status */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {(Object.entries(TICKET_STATUS_LABELS) as [TicketStatus, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Assign */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Assigned To</label>
            <div className="flex gap-2">
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">— Unassigned —</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignToMe}
                className="h-10 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Assign to me
              </button>
            </div>
          </div>

          {/* Resolution notes */}
          {['resolved', 'closed'].includes(status) && (
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Resolution Notes</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                placeholder="Describe how the issue was resolved..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}
        </div>

        <Button variant="primary" onClick={handleUpdate} loading={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {/* Add comment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 mb-4">Add Comment</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Write a comment or internal note..."
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-slate-900 mb-3"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-sm text-slate-600">
              Internal note <span className="text-xs text-slate-400">(not visible to requester)</span>
            </span>
          </label>
          <Button variant={isInternal ? 'secondary' : 'primary'} onClick={handleComment} loading={posting} disabled={!comment.trim()}>
            {isInternal ? '🔒 Post Internal Note' : '💬 Post Comment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
