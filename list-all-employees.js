const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://izjbyapchsrufshdtsgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6amJ5YXBjaHNydWZzaGR0c2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjY4MzMsImV4cCI6MjA3NDcwMjgzM30.DANGDhEXbcIFjcMlAa2V30RcNfNiCwas3_4CqoKkfL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listEmployees() {
  console.log('👥 Listing All Employees\n');

  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`Total Employees: ${employees.length}\n`);
    console.log('-----------------------------------');

    employees.forEach((emp, index) => {
      const adminBadge = emp.is_admin ? ' [ADMIN]' : '';
      const activeBadge = emp.is_active ? '' : ' [INACTIVE]';
      console.log(`${index + 1}. ${emp.full_name || emp.name}${adminBadge}${activeBadge}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   ID: ${emp.id}`);
      console.log('');
    });

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

listEmployees();
