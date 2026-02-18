require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkActivityStructure() {
  try {
    console.log('📊 Fetching sample activities...\n');

    // Get a few activities with all their relationships
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        employee:employees!activities_employee_id_fkey(id, name, email),
        department:departments!activities_department_id_fkey(id, name),
        activity_type:activity_types!activities_activity_type_id_fkey(id, name)
      `)
      .limit(3);

    if (error) {
      console.error('❌ Error fetching activities:', error);
      return;
    }

    console.log(`Found ${activities?.length || 0} activities\n`);

    if (activities && activities.length > 0) {
      activities.forEach((activity, index) => {
        console.log(`\n📝 Activity ${index + 1}:`);
        console.log('  ID:', activity.id);
        console.log('  Title:', activity.title);
        console.log('  Description:', activity.description);
        console.log('  Activity Date:', activity.activity_date);
        console.log('  Week:', activity.week);
        console.log('  Hours:', activity.hours);
        console.log('  Employee:', activity.employee?.name || 'N/A');
        console.log('  Department:', activity.department?.name || 'N/A');
        console.log('  Activity Type:', activity.activity_type?.name || 'N/A');
        console.log('  Activity Type ID:', activity.activity_type_id);
        console.log('  Department ID:', activity.department_id);
        console.log('  Employee ID:', activity.employee_id);
      });
    } else {
      console.log('ℹ️  No activities found in database');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

checkActivityStructure();
