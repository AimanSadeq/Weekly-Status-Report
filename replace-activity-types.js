require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Department mapping
const DEPARTMENTS = {
  'Website (Digital/Marketing)': 'Website & Digital Marketing',
  'Operations': 'Operations',
  'Consultants': 'Consultants',
  'Finance': 'Finance',
  'Management': 'Management',
  'Business Development & Relationship Management': 'BD & RM'
};

// New activity types with their department associations
const NEW_ACTIVITY_TYPES = [
  {
    name: 'Designing and posting social media content',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Email marketing campaigns and newsletters',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Managing digital ads (Google, LinkedIn, Meta campaigns)',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Monitoring web traffic and lead conversion performance',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Search Engine Optimization (SEO) and Google Analytics tracking',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Updating event calendars and registration forms',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Website content updates (course pages, trainer profiles, blogs)',
    category: 'Digital Marketing',
    departments: ['Website (Digital/Marketing)']
  },
  {
    name: 'Coordinating between Business Development, Consultants, and Clients',
    category: 'Operations',
    departments: ['Operations', 'Consultants']
  },
  {
    name: 'Coordinating with Consultants to design course content',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Managing logistics for classroom and online sessions (venue, materials, trainer travel)',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'eLearning vouchers',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Preparing and sending certificates, evaluations, and post-course reports',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Preparing course outlines',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Tracking course timelines, attendance, and completion status',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Preparing training proposals',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Preparing consulting proposals',
    category: 'Operations',
    departments: ['Operations']
  },
  {
    name: 'Designing customized course outlines',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Delivering classroom, virtual, consulting, ITP, and coaching sessions',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Reviewing and updating course content',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Designing new courses',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Sick',
    category: 'Leave',
    departments: ['Website (Digital/Marketing)', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']
  },
  {
    name: 'Designing eLearning',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Proposal Support',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Vacation',
    category: 'Leave',
    departments: ['Website (Digital/Marketing)', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']
  },
  {
    name: 'Bringing-in business (BD)',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Attending conferences',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Consultant support',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Special projects',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Course materials design/audit',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Delivering Training (Billing Days)',
    category: 'Training Delivery',
    departments: ['Consultants']
  },
  {
    name: 'Handling VAT and tax compliance for UAE and KSA operations',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Maintaining budget control and cost allocation by department or client',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Managing invoicing, collections, and payments (clients, trainers, vendors)',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Managing trainer contracts, payroll, and expense claims',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Monitoring course profitability and billing day utilization',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Preparing monthly and annual financial statements (P&L, balance sheet, cash flow)',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Supporting management with financial performance dashboards and cost optimization insights',
    category: 'Finance',
    departments: ['Finance']
  },
  {
    name: 'Other activities',
    category: 'General',
    departments: ['Website (Digital/Marketing)', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']
  },
  {
    name: 'Approving major proposals, budgets, and partnerships',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Driving organizational innovation (eLearning, gamification, AI tools)',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Leading leadership and performance review meetings',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Managing key stakeholder and partner relationships (ministries, academies, institutions)',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Overseeing policy creation, governance, and compliance',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Overseeing quality assurance and client satisfaction metrics',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Reviewing monthly performance dashboards and pipeline reports',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Setting corporate strategy, annual targets, and departmental KPIs',
    category: 'Management',
    departments: ['Management']
  },
  {
    name: 'Collaborating with the Marketing team for campaigns and promotions',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Conducting client meetings, needs assessments, and follow-ups',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Coordinating with Operations to develop customized proposals and course outlines',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Identifying and engaging corporate and government clients (KSA, UAE, Iraq, Jordan)',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Maintaining a database of opportunities and relationships',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Managing the sales pipeline (calls, visits, proposals requested, proposals confirmed)',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Representing VIFM at events, conferences, and exhibitions',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Strengthening existing client relationships through continuous engagement and feedback',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Procurement and vendor portal management',
    category: 'Business Development',
    departments: ['Business Development & Relationship Management']
  },
  {
    name: 'Professional development',
    category: 'General',
    departments: ['Website (Digital/Marketing)', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']
  }
];

async function replaceActivityTypes() {
  try {
    console.log('🚀 Starting activity types replacement...\n');

    // Step 1: Get all departments with their IDs
    console.log('📋 Step 1: Fetching departments...');
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name');

    if (deptError) {
      throw new Error(`Failed to fetch departments: ${deptError.message}`);
    }

    // Create department name to ID mapping
    const deptNameToId = {};
    departments.forEach(dept => {
      deptNameToId[dept.name] = dept.id;
    });

    console.log(`✅ Found ${departments.length} departments\n`);

    // Step 2: Check if activities exist that reference activity_types
    console.log('📋 Step 2: Checking for existing activities...');
    const { count: activityCount, error: actCountError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true });

    if (actCountError) {
      console.error('Warning: Could not check activities:', actCountError.message);
    } else {
      console.log(`ℹ️  Found ${activityCount} existing activities`);
      console.log('ℹ️  All old activity types will be deleted and replaced with new ones\n');
    }

    // Step 3: Set all existing activities to have NULL activity_type_id
    console.log('📋 Step 3: Unlinking activity types from existing activities...');
    if (activityCount > 0) {
      const { error: unlinkError } = await supabase
        .from('activities')
        .update({ activity_type_id: null })
        .not('activity_type_id', 'is', null);

      if (unlinkError) {
        throw new Error(`Failed to unlink activities: ${unlinkError.message}`);
      }
      console.log('✅ Existing activities unlinked from activity types\n');
    } else {
      console.log('✅ No activities to unlink\n');
    }

    // Step 4: Delete all activity_type_departments associations
    console.log('📋 Step 4: Removing all activity type department associations...');
    const { data: allActivityTypes } = await supabase
      .from('activity_types')
      .select('id');

    if (allActivityTypes && allActivityTypes.length > 0) {
      const activityTypeIds = allActivityTypes.map(at => at.id);

      const { error: deleteDeptLinksError } = await supabase
        .from('activity_type_departments')
        .delete()
        .in('activity_type_id', activityTypeIds);

      if (deleteDeptLinksError) {
        console.error('Warning: Could not delete department links:', deleteDeptLinksError.message);
      }
    }

    console.log('✅ Department associations removed\n');

    // Step 5: Delete all existing activity types (hard delete)
    console.log('📋 Step 5: Deleting all existing activity types...');
    const { error: deleteError } = await supabase
      .from('activity_types')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      throw new Error(`Failed to delete activity types: ${deleteError.message}`);
    }

    console.log('✅ All existing activity types deleted\n');

    // Step 6: Insert new activity types
    console.log('📋 Step 6: Creating new activity types...');
    let successCount = 0;
    let errorCount = 0;

    for (const [index, activityType] of NEW_ACTIVITY_TYPES.entries()) {
      try {
        // Create the activity type
        const { data: newActivityType, error: createError } = await supabase
          .from('activity_types')
          .insert([{
            name: activityType.name,
            category: activityType.category,
            is_consultant_only: false,
            is_mandatory: false,
            display_order: index + 1,
            is_active: true,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error(`❌ Failed to create "${activityType.name}": ${createError.message}`);
          errorCount++;
          continue;
        }

        // Associate with departments
        const deptLinks = activityType.departments
          .filter(deptName => deptNameToId[DEPARTMENTS[deptName]])
          .map(deptName => ({
            activity_type_id: newActivityType.id,
            department_id: deptNameToId[DEPARTMENTS[deptName]]
          }));

        if (deptLinks.length > 0) {
          const { error: linkError } = await supabase
            .from('activity_type_departments')
            .insert(deptLinks);

          if (linkError) {
            console.error(`⚠️  Created "${activityType.name}" but failed to link departments: ${linkError.message}`);
          }
        }

        successCount++;
        console.log(`✅ ${successCount}. Created: ${activityType.name}`);

      } catch (err) {
        console.error(`❌ Error processing "${activityType.name}": ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} activity types`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`🗑️  Old activity types deleted`);
    console.log('\n✅ Activity types replacement complete!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
replaceActivityTypes();
