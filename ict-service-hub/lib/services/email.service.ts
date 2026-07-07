import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null
const fromDomain = process.env.RESEND_FROM_DOMAIN || 'dioceseofkalookan.org'
const fromEmail = process.env.RESEND_FROM_EMAIL || `ICT Service Hub <noreply@${fromDomain}>`
const adminEmail = process.env.ICT_ADMIN_EMAIL || 'ict@dioceseofkalookan.org'

export const EmailService = {
  async sendTicketCreatedEmail(to: string, ticketNumber: string, title: string, requesterName: string) {
    if (!resend) return

    try {
      await resend.emails.send({
        from: fromEmail,
        to,
        subject: `[${ticketNumber}] Ticket Received: ${title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Ticket Received</h2>
            <p>Hi ${requesterName},</p>
            <p>Your ticket <strong>${ticketNumber}</strong> has been successfully submitted.</p>
            <p>Our ICT team will review it shortly. You will be notified of any status updates.</p>
            <br/>
            <p>Thank you,</p>
            <p><strong>ICT Service Hub</strong></p>
          </div>
        `
      })
    } catch (error) {
      console.error('[EmailService] Failed to send ticket created email:', error)
    }
  },

  async sendTicketStatusUpdateEmail(to: string, ticketNumber: string, title: string, newStatus: string, requesterName: string) {
    if (!resend) return

    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      open: 'Open',
      in_progress: 'In Progress',
      on_hold: 'On Hold',
      resolved: 'Resolved',
      closed: 'Closed',
    }
    const label = statusLabels[newStatus] || newStatus

    try {
      await resend.emails.send({
        from: fromEmail,
        to,
        subject: `[${ticketNumber}] Status Update: ${label}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Ticket Status Updated</h2>
            <p>Hi ${requesterName},</p>
            <p>Your ticket <strong>${ticketNumber}</strong> ("${title}") has been updated to <strong>${label}</strong>.</p>
            <p>You can check the portal for more details or any comments from our team.</p>
            <br/>
            <p>Thank you,</p>
            <p><strong>ICT Service Hub</strong></p>
          </div>
        `
      })
    } catch (error) {
      console.error('[EmailService] Failed to send status update email:', error)
    }
  },

  async sendAdminAlertEmail(ticketNumber: string, title: string, category: string, requesterName: string) {
    if (!resend) return

    const categoryLabel = category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    try {
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Ticket Alert: [${ticketNumber}] ${title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Ticket Submitted</h2>
            <p>A new ticket has been submitted to the ICT Service Hub.</p>
            <ul>
              <li><strong>Ticket Number:</strong> ${ticketNumber}</li>
              <li><strong>Title:</strong> ${title}</li>
              <li><strong>Category:</strong> ${categoryLabel}</li>
              <li><strong>Requester:</strong> ${requesterName}</li>
            </ul>
            <p>Please log in to the admin dashboard to review and assign this ticket.</p>
          </div>
        `
      })
    } catch (error) {
      console.error('[EmailService] Failed to send admin alert email:', error)
    }
  }
}
