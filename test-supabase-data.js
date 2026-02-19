const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://izjbyapchsrufshdtsgu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6amJ5YXBjaHNydWZzaGR0c2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjY4MzMsImV4cCI6MjA3NDcwMjgzM30.DANGDhEXbcIFjcMlAa2V30RcNfNiCwas3_4CqoKkfL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testData() {
  console.log('📊 Checking Supabase data...\n');

  try {
    // Check employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, email, full_name, is_admin')
      .limit(5);

    if (empError) {
      console.error('❌ Error fetching employees:', empError);
    } else {
      console.log('✅ Sample Employees:');
      employees.forEach(e => console.log(`   - ${e.email} (${e.full_name}) ${e.is_admin ? '[ADMIN]' : ''}`));
    }

    // Check activity types
    const { data: activityTypes, error: atError } = await supabase
      .from('activity_types')
      .select('id, name');

    if (atError) {
      console.error('\n❌ Error fetching activity types:', atError);
    } else {
      console.log('\n✅ Activity Types:');
      activityTypes.forEach(at => console.log(`   - ${at.name}`));
    }

    // Check departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name');

    if (deptError) {
      console.error('\n❌ Error fetching departments:', deptError);
    } else {
      console.log('\n✅ Departments:');
      departments.forEach(d => console.log(`   - ${d.name}`));
    }

    // Check activities
    const { data: activities, error: actError, count } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .limit(3);

    if (actError) {
      console.error('\n❌ Error fetching activities:', actError);
    } else {
      console.log(`\n✅ Activities (Total: ${count})`);
      if (activities.length > 0) {
        activities.forEach(a => console.log(`   - ID: ${a.id}, Status: ${a.status}, Date: ${a.report_date}`));
      } else {
        console.log('   (No activities yet)');
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testData();
