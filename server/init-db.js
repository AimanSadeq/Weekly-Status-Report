const db = require('./models/db');

/**
 * Initialize VIF Activity Tracker Database
 * Populates with all 17 employees
 */

const employees = [
  {
    email: 'asadeq@viftraining.com',
    name: 'Aiman',
    role: 'admin',
    departments: ['Management', 'Consultants']
  },
  {
    email: 'omar@viftraining.com',
    name: 'Omar',
    role: 'employee',
    departments: ['Website & Digital Marketing', 'Consultants']
  },
  {
    email: 'ahmadg@viftraining.com',
    name: 'Ahmad',
    role: 'employee',
    departments: ['Operations', 'Consultants']
  },
  {
    email: 'akayed@viftraining.com',
    name: 'Amal',
    role: 'employee',
    departments: ['Business Development & Relationship Management', 'Consultants']
  },
  {
    email: 'ali@viftraining.com',
    name: 'Ali',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'ammar@viftraining.com',
    name: 'Ammar',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'ajubain@viftraining.com',
    name: 'Alaa',
    role: 'employee',
    departments: ['Operations']
  },
  {
    email: 'dalia@viftraining.com',
    name: 'Dalia',
    role: 'employee',
    departments: ['Operations']
  },
  {
    email: 'mohamad@viftraining.com',
    name: 'MJ',
    role: 'employee',
    departments: ['Finance']
  },
  {
    email: 'asaad@viftraining.com',
    name: 'Asaad',
    role: 'employee',
    departments: ['Website & Digital Marketing']
  },
  {
    email: 'ibrahim@viftraining.com',
    name: 'Ibrahim',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'moayad@viftraining.com',
    name: 'Moayad',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'mufid@viftraining.com',
    name: 'Mufid',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'yassin@viftraining.com',
    name: 'Yassin',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'wael@viftraining.com',
    name: 'Wael',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'yousef@viftraining.com',
    name: 'Yousef',
    role: 'employee',
    departments: ['Consultants']
  },
  {
    email: 'rima@viftraining.com',
    name: 'Rima',
    role: 'employee',
    departments: ['Operations']
  }
];

async function initializeDatabase() {
  console.log('🔧 Initializing VIF Activity Tracker Database...\n');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // console.log('Clearing existing data...');
    // await db.clearAll();
    
    // Create all employees
    console.log('Creating employees...');
    for (const employee of employees) {
      await db.createUser(employee);
      console.log(`✅ Created user: ${employee.name} (${employee.email})`);
    }

    // Initialize default email preferences for all users
    console.log('\nSetting up email preferences...');
    for (const employee of employees) {
      await db.updateEmailPreferences(
        employee.email,
        db.getDefaultEmailPreferences()
      );
      console.log(`✅ Email preferences set for: ${employee.name}`);
    }

    console.log('\n✅ Database initialization complete!');
    console.log(`📊 Total employees: ${employees.length}`);
    console.log('\n🚀 You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase, employees };
