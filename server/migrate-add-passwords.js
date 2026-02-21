/**
 * Migration: Add password_hash column to employees table
 * Sets default password "Vifm2025!" for all existing employees.
 *
 * Usage: node server/migrate-add-passwords.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DEFAULT_PASSWORD = 'Vifm2025!';
const SALT_ROUNDS = 10;

async function migrate() {
  console.log('Starting password migration...');

  // Step 1: Add password_hash column (uses raw SQL via rpc or just try updating)
  // Supabase JS client doesn't support ALTER TABLE directly,
  // so we'll just hash the default password and update all employees.
  // The column must be added via Supabase SQL editor first if it doesn't exist:
  //   ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash TEXT;

  console.log('\nIMPORTANT: Make sure you have run this SQL in Supabase SQL Editor first:');
  console.log('  ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash TEXT;\n');

  // Step 2: Hash the default password
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log(`Default password hashed (bcrypt, ${SALT_ROUNDS} rounds)`);

  // Step 3: Fetch all employees
  const { data: employees, error: fetchError } = await supabase
    .from('employees')
    .select('id, email, full_name, password_hash');

  if (fetchError) {
    console.error('Error fetching employees:', fetchError.message);
    process.exit(1);
  }

  console.log(`Found ${employees.length} employees`);

  // Step 4: Update each employee that doesn't already have a password hash
  let updated = 0;
  let skipped = 0;

  for (const emp of employees) {
    if (emp.password_hash) {
      console.log(`  Skipping ${emp.full_name} (${emp.email}) — already has password`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('employees')
      .update({ password_hash: hash })
      .eq('id', emp.id);

    if (updateError) {
      console.error(`  Error updating ${emp.email}:`, updateError.message);
    } else {
      console.log(`  Updated ${emp.full_name} (${emp.email})`);
      updated++;
    }
  }

  console.log(`\nMigration complete: ${updated} updated, ${skipped} skipped`);
  console.log(`All employees can now log in with password: ${DEFAULT_PASSWORD}`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
