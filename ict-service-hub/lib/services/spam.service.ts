import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { AuditService } from './audit.service'

export interface SpamCheckResult {
  isSpam: boolean
  block: boolean
  reason: string | null
}

export const SpamService = {
  /**
   * Checks if a ticket submission should be flagged or blocked based on limits:
   * - Max 5 tickets per user per hour (blocks on 6+)
   * - Max 8 tickets per IP per hour (blocks on 9+)
   * - Flags as spam if user creates 3-5 tickets
   * - Flags as spam if IP creates 5-8 tickets
   */
  async checkTicketSpam(ip: string, userId?: string | null): Promise<SpamCheckResult> {
    const adminClient = createSupabaseAdminClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { count: ipCount, error: ipError } = await adminClient
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo)

    if (ipError) console.error('[SpamService] Error checking IP count:', ipError)

    const totalIpCount = ipCount || 0

    if (totalIpCount >= 8) {
      await this.recordSpamAttempt(ip, userId, 'Exceeded max 8 tickets per IP per hour')
      return { isSpam: true, block: true, reason: 'Exceeded max 8 tickets per IP per hour' }
    }

    let totalUserCount = 0
    if (userId) {
      const { count: userCount, error: userError } = await adminClient
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('requester_id', userId)
        .gte('created_at', oneHourAgo)

      if (userError) console.error('[SpamService] Error checking user count:', userError)
      totalUserCount = userCount || 0

      if (totalUserCount >= 5) {
        await this.recordSpamAttempt(ip, userId, 'Exceeded max 5 tickets per user per hour')
        return { isSpam: true, block: true, reason: 'Exceeded max 5 tickets per user per hour' }
      }
    }

    if (totalUserCount >= 3) {
      return { isSpam: true, block: false, reason: 'High ticket volume for user' }
    }
    if (totalIpCount >= 5) {
      return { isSpam: true, block: false, reason: 'High ticket volume for IP' }
    }

    return { isSpam: false, block: false, reason: null }
  },

  async recordSpamAttempt(ip: string, userId: string | null | undefined, reason: string) {
    const adminClient = createSupabaseAdminClient()

    await AuditService.logAction({
      actorId: userId || null,
      actorEmail: null,
      action: 'spam_flagged',
      resource: 'ticket_creation',
      newValues: { reason },
      ipAddress: ip
    })

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    let query = (adminClient
      .from('spam_attempts') as any)
      .select('*')
      .eq('ip_address', ip)
      .eq('attempt_type', 'ticket_flood')
      .gte('window_start', oneHourAgo)
      
    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.is('user_id', null)
    }

    const { data: existing } = await query.order('window_start', { ascending: false }).limit(1).single()

    if (existing) {
      await (adminClient
        .from('spam_attempts') as any)
        .update({
          count: existing.count + 1,
          last_attempt: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      await (adminClient
        .from('spam_attempts') as any)
        .insert({
          ip_address: ip,
          user_id: userId || null,
          attempt_type: 'ticket_flood',
          count: 1,
          window_start: new Date().toISOString(),
          last_attempt: new Date().toISOString()
        })
    }
  }
}
