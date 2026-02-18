const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://izjbyapchsrufshdtsgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6amJ5YXBjaHNydWZzaGR0c2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjY4MzMsImV4cCI6MjA3NDcwMjgzM30.DANGDhEXbcIFjcMlAa2V30RcNfNiCwas3_4CqoKkfL8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  console.log('🔍 Checking Supabase connection and table structure...\n');

  try {
    // Test connection by fetching activities
    const { data, error, count } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ Error connecting to Supabase:', error);
      return;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Total records in activities table: ${count}`);

    if (data && data.length > 0) {
      console.log('\n📋 Sample record structure:');
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n🔑 Available columns:');
      console.log(Object.keys(data[0]).join(', '));
    } else {
      console.log('\n⚠️  Table is empty. Cannot determine structure from data.');
      console.log('Please provide the table schema or add a sample record.');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSupabase();
