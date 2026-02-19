const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://izjbyapchsrufshdtsgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6amJ5YXBjaHNydWZzaGR0c2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjY4MzMsImV4cCI6MjA3NDcwMjgzM30.DANGDhEXbcIFjcMlAa2V30RcNfNiCwas3_4CqoKkfL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('📊 Checking current Supabase data...\n');

  try {
    // Get ALL activity types
    const { data: activityTypes, error: atError } = await supabase
      .from('activity_types')
      .select('*')
      .order('name');

    if (atError) {
      console.error('❌ Error fetching activity types:', atError);
    } else {
      console.log(`✅ Activity Types (${activityTypes.length} total):`);
      activityTypes.forEach((at, index) => {
        console.log(`${index + 1}. "${at.name}" (consultant_only: ${at.is_consultant_only}, active: ${at.is_active})`);
      });
    }

    // Get ALL departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (deptError) {
      console.error('\n❌ Error fetching departments:', deptError);
    } else {
      console.log(`\n✅ Departments (${departments.length} total):`);
      departments.forEach((d, index) => {
        console.log(`${index + 1}. "${d.name}" (active: ${d.is_active})`);
      });
    }

    // Check if junction table exists
    const { data: junctionData, error: junctionError } = await supabase
      .from('activity_type_departments')
      .select('*')
      .limit(5);

    if (junctionError) {
      console.log('\n⚠️  Junction table does not exist yet or has no data');
      console.log('   Error:', junctionError.message);
    } else {
      console.log(`\n✅ Junction table exists with ${junctionData.length} sample records`);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkData();
