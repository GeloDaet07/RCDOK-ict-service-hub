// lib/email/resend.ts
// Email notifications via Resend (free tier: 3,000 emails/month)

import { Resend } from 'resend'
import type { ServiceCategory } from '@/types/database'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'ICT Service Hub <no-reply@dioceseofkalookan.org>'
const BRAND_COLOR = '#0F172A'
const GOLD_COLOR = '#D97706'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ict.dioceseofkalookan.org'

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  systems_software: 'Systems & Software',
  network_infrastructure: 'Network Infrastructure',
  live_streaming: 'Live-Streaming Operations',
  photography: 'Photography',
  videography: 'Videography',
}

// ---- Base email template ----
function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND_COLOR};padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="color:${GOLD_COLOR};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Diocese of Kalookan</div>
                  <div style="color:#FFFFFF;font-size:20px;font-weight:bold;">ICT Service Hub</div>
                </td>
                <td align="right">
                  <div style="color:#94A3B8;font-size:11px;">Support & Media Services</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;padding:20px 40px;border-top:1px solid #E2E8F0;">
            <p style="margin:0;color:#94A3B8;font-size:12px;text-align:center;">
              This is an automated message from the ICT Service Hub.<br/>
              Diocese of Kalookan — ICT Department<br/>
              <a href="${BASE_URL}" style="color:${GOLD_COLOR};text-decoration:none;">Visit Portal</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ---- Types ----
interface TicketNotificationPayload {
  type: 'ticket_created' | 'ticket_assigned' | 'ticket_resolved' | 'status_changed'
  recipientEmail: string
  recipientName: string
  ticketNumber: string
  ticketTitle: string
  category: ServiceCategory
  newStatus?: string
  assigneeName?: string
  resolutionNotes?: string
}

// ============================================================
// SEND TICKET NOTIFICATION
// ============================================================

export async function sendTicketNotification(payload: TicketNotificationPayload) {
  const {
    type,
    recipientEmail,
    recipientName,
    ticketNumber,
    ticketTitle,
    category,
    newStatus,
    assigneeName,
    resolutionNotes,
  } = payload

  const ticketUrl = `${BASE_URL}/tickets`
  const categoryLabel = CATEGORY_LABELS[category]

  let subject = ''
  let bodyHtml = ''

  const greeting = `<p style="color:#1E293B;font-size:16px;margin:0 0 16px;">Dear ${recipientName},</p>`
  const ticketRef = `
    <div style="background:#F8FAFC;border-left:4px solid ${GOLD_COLOR};padding:16px 20px;border-radius:4px;margin:20px 0;">
      <div style="color:#64748B;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Ticket Reference</div>
      <div style="color:#0F172A;font-size:18px;font-weight:bold;margin:4px 0;">${ticketNumber}</div>
      <div style="color:#475569;font-size:14px;">${ticketTitle}</div>
      <div style="color:#94A3B8;font-size:12px;margin-top:4px;">${categoryLabel}</div>
    </div>`
  const ctaButton = `
    <div style="text-align:center;margin:28px 0;">
      <a href="${ticketUrl}" style="background:${BRAND_COLOR};color:#FFFFFF;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">View My Tickets</a>
    </div>`

  switch (type) {
    case 'ticket_created':
      subject = `[${ticketNumber}] Ticket Received — ICT Service Hub`
      bodyHtml = baseTemplate(subject, `
        ${greeting}
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Thank you for submitting your service request. Our ICT team has received it and will respond as soon as possible.
        </p>
        ${ticketRef}
        <p style="color:#64748B;font-size:14px;">You will be notified when your ticket is assigned or updated.</p>
        ${ctaButton}
      `)
      break

    case 'ticket_assigned':
      subject = `[${ticketNumber}] Your Ticket Has Been Assigned`
      bodyHtml = baseTemplate(subject, `
        ${greeting}
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Your service request has been assigned to <strong>${assigneeName || 'an ICT staff member'}</strong> who will be working on your concern.
        </p>
        ${ticketRef}
        ${ctaButton}
      `)
      break

    case 'status_changed':
      subject = `[${ticketNumber}] Status Update — ${newStatus?.replace('_', ' ').toUpperCase()}`
      bodyHtml = baseTemplate(subject, `
        ${greeting}
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">
          The status of your service request has been updated.
        </p>
        ${ticketRef}
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;padding:14px 18px;border-radius:6px;margin:16px 0;">
          <span style="color:#1E40AF;font-size:14px;font-weight:bold;">New Status: ${newStatus?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </div>
        ${ctaButton}
      `)
      break

    case 'ticket_resolved':
      subject = `[${ticketNumber}] Your Ticket Has Been Resolved`
      bodyHtml = baseTemplate(subject, `
        ${greeting}
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">
          We are pleased to inform you that your service request has been resolved.
        </p>
        ${ticketRef}
        ${resolutionNotes ? `
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:14px 18px;border-radius:6px;margin:16px 0;">
          <div style="color:#166534;font-size:13px;font-weight:bold;margin-bottom:4px;">Resolution Notes</div>
          <div style="color:#14532D;font-size:14px;">${resolutionNotes}</div>
        </div>` : ''}
        <p style="color:#64748B;font-size:14px;">If the issue persists, please open a new ticket or reply to this email.</p>
        ${ctaButton}
      `)
      break
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html: bodyHtml,
    })
  } catch (err) {
    console.error('[Resend] Failed to send email:', err)
  }
}

// ============================================================
// SEND ADMIN ALERT (new ticket notification to ICT team)
// ============================================================

export async function sendAdminNewTicketAlert(payload: {
  ticketNumber: string
  ticketTitle: string
  category: ServiceCategory
  priority: string
  requesterName: string
  requesterEmail: string
}) {
  const adminEmail = process.env.ICT_ADMIN_EMAIL
  if (!adminEmail) return

  const { ticketNumber, ticketTitle, category, priority, requesterName, requesterEmail } = payload
  const priorityColors: Record<string, string> = {
    urgent: '#DC2626',
    high: '#EA580C',
    medium: '#D97706',
    low: '#16A34A',
  }

  const html = baseTemplate(`New Ticket: ${ticketNumber}`, `
    <p style="color:#1E293B;font-size:16px;margin:0 0 16px;">A new service request has been submitted.</p>
    <div style="background:#F8FAFC;border-left:4px solid ${priorityColors[priority] || '#D97706'};padding:16px 20px;border-radius:4px;margin:20px 0;">
      <div style="color:#64748B;font-size:12px;font-weight:bold;letter-spacing:1px;margin-bottom:4px;">${ticketNumber}</div>
      <div style="color:#0F172A;font-size:17px;font-weight:bold;">${ticketTitle}</div>
      <div style="color:#475569;font-size:13px;margin-top:6px;">${CATEGORY_LABELS[category]}</div>
      <div style="display:inline-block;background:${priorityColors[priority]};color:#fff;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px;margin-top:8px;text-transform:uppercase;">${priority} Priority</div>
    </div>
    <p style="color:#475569;font-size:14px;">Submitted by: <strong>${requesterName}</strong> (${requesterEmail})</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${BASE_URL}/admin/tickets" style="background:${BRAND_COLOR};color:#FFFFFF;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;">Review in Admin Portal</a>
    </div>
  `)

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[NEW] ${ticketNumber} — ${priority.toUpperCase()} Priority`,
      html,
    })
  } catch (err) {
    console.error('[Resend] Admin alert failed:', err)
  }
}
