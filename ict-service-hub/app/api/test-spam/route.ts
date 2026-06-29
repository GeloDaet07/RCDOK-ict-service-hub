import { NextResponse } from 'next/server'
import { submitGuestTicket } from '@/app/guest/submit-ticket/actions'

export async function GET() {
  const results = []
  
  for (let i = 1; i <= 10; i++) {
    try {
      const res = await submitGuestTicket({
        guest_name: "Spammer " + i,
        guest_email: `spam@example.com`,
        title: "Spam Ticket " + i,
        description: "This is a spam ticket to test the anti-spam system.",
        category: "systems_software",
        priority: "low"
      })
      results.push({ attempt: i, success: true, ticket_number: res.ticket_number })
    } catch (e: any) {
      results.push({ attempt: i, success: false, error: e.message })
    }
  }
  
  return NextResponse.json({
    message: "Spam simulation complete",
    results
  })
}
