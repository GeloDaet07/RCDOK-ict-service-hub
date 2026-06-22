// components/user/UserCommentBox.tsx
'use client'
import { useState } from 'react'
import { addComment } from '@/lib/actions/tickets'

interface Props {
  ticketId: string
}

export function UserCommentBox({ ticketId }: Props) {
  const [comment, setComment]   = useState('')
  const [posting, setPosting]   = useState(false)
  const [message, setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async () => {
    if (!comment.trim()) return
    setPosting(true)
    setMessage(null)

    const result = await addComment({
      ticket_id:   ticketId,
      body:        comment.trim(),
      is_internal: false,
    })

    setPosting(false)

    if (result.success) {
      setComment('')
      setMessage({ type: 'success', text: 'Your comment has been posted.' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add a Comment</p>

      {message && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="float-right text-xs opacity-60 hover:opacity-100 leading-5"
          >
            ✕
          </button>
        </div>
      )}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Add more context, provide an update, or ask a follow-up question…"
        disabled={posting}
        className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-navy-950 disabled:opacity-60 disabled:cursor-not-allowed"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!comment.trim() || posting}
          className="h-9 px-4 rounded-btn text-sm font-semibold bg-navy-950 text-liturgical-white hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {posting ? 'Posting…' : '💬 Post Comment'}
        </button>
      </div>
    </div>
  )
}