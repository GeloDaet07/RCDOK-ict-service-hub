import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'
import path from 'path'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function clearSpam() {
  console.log("🧹 Sweeping up spam tickets...")
  
  // Delete all tickets that are flagged as spam
  const { data, error, count } = await supabase
    .from('tickets')
    .delete({ count: 'exact' })
    .eq('is_spam_flagged', true)
  
  if (error) {
    console.error("❌ Failed to delete spam tickets:", error.message)
    process.exit(1)
  }
  
  console.log(`✅ Successfully deleted ${count} spam ticket(s)!`)
}

clearSpam()
