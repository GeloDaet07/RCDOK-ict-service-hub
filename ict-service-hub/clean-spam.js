import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  //Deletes spam tickets
  console.log('Deleting spam tickets...');
  const { error: ticketError } = await supabase
    .from('tickets')
    .delete()
    .like('guest_name', 'Spammer%');

  if (ticketError) {
    console.error('Tickets:', ticketError);
  } else {
    console.log('Spam tickets deleted.');
  }

  //Deletes spam attempts
  console.log('Deleting spam attempts...');
  const { error: attemptError } = await supabase
    .from('spam_attempts')
    .delete()
    .eq('ip_address', '127.0.0.1');

  if (attemptError) {
    console.error('Spam Attempts:', attemptError);
  } else {
    console.log('Spam attempts deleted.');
  }

  //Deletes audit logs for spam_flagged
  console.log('Deleting audit logs for spam...');
  const { error: flaggedLogError } = await supabase
    .from('audit_logs')
    .delete()
    .eq('action', 'spam_flagged')
    .eq('ip_address', '127.0.0.1');

  if (flaggedLogError) {
    console.error('Audit Logs:', flaggedLogError);
  } else {
    console.log('Spam audit logs deleted.');
  }

  //Deletes audit logs for ticket_created
  const { error: createdLogError } = await supabase
    .from('audit_logs')
    .delete()
    .eq('action', 'ticket_created')
    .eq('ip_address', '127.0.0.1');

  if (createdLogError) {
    console.error('Audit Logs:', createdLogError);
  } else {
    console.log('Ticket creation audit logs deleted.');
  }

  console.log('All test spam tickets cleared');
}

clean();