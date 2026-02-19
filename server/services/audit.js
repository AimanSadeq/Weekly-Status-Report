/**
 * Audit Trail Service - Fire-and-forget audit logging
 */

const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

async function logAudit({ action, entityType, entityId, actorEmail, actorName, changes, ipAddress }) {
  try {
    if (!HAS_SUPABASE) {
      console.log(`[AUDIT] ${action} on ${entityType}${entityId ? ':' + entityId : ''} by ${actorEmail}`);
      return;
    }

    await supabase.from('audit_log').insert([{
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      actor_email: actorEmail,
      actor_name: actorName || null,
      changes: changes || null,
      ip_address: ipAddress || null,
      created_at: new Date().toISOString()
    }]);
  } catch (error) {
    // Fire-and-forget: don't let audit failures break the app
    console.error('Audit log error:', error.message);
  }
}

module.exports = { logAudit };
