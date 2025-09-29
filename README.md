# VIF Training Employee Activity Tracking System

A comprehensive web application for tracking employee weekly activities with smart department/activity filtering, admin review capabilities, and analytics.

## 🚀 Features

### For Employees
- **Weekly Activity Submission**: Submit activities with detailed information
- **Smart Filtering**: Activity types automatically filtered by department
- **Real-time Notifications**: Get notified about feedback and reminders
- **Activity History**: View and track submitted activities
- **Status Tracking**: See submission status for current week

### For Administrators
- **Review Dashboard**: Review and provide feedback on employee activities
- **Analytics & Reports**: Visual charts and metrics for activity tracking
- **Employee Status**: Monitor submission status across all employees
- **Export Capabilities**: Export activities to Excel for further analysis
- **Quarterly Reviews**: Mark items for quarterly discussion
- **Notification System**: Automatic reminders and feedback notifications

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Domain email addresses (@viftraining.com)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone [your-repo-url]
cd vif-activity-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor and run the database schema:
   - Execute `/database/schema.sql`
   - Execute `/database/seed-data.sql`

### 4. Configure environment variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_DOMAIN=viftraining.com
NEXT_PUBLIC_COMPANY_NAME=VIF Training
ADMIN_EMAIL=ahmad@viftraining.com
```

### 5. Enable Authentication in Supabase

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates for:
   - Confirmation emails
   - Password reset emails
   - Magic link emails

### 6. Set up Row Level Security (RLS)

The RLS policies are included in the schema.sql file, but verify they're enabled:
1. Go to Database → Tables
2. Check that RLS is enabled for:
   - activities
   - activity_feedback
   - notifications
   - employees

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Structure

### Main Tables
- **employees**: User profiles linked to auth.users
- **departments**: Company departments
- **activity_types**: Types of activities (with department mappings)
- **activities**: Main activity entries
- **activity_feedback**: Comments and feedback on activities
- **notifications**: In-app notification system
- **employee_departments**: Maps employees to departments

## 👥 Employee-Department Mapping

The system is pre-configured with the following employee-department assignments:

| Employee | Primary Department | Secondary Department |
|----------|-------------------|---------------------|
| Rakan | BDRM | - |
| Omar | Website | Consultants |
| Ahmad | Operations | Consultants |
| Aiman | Management | Consultants |
| Farah | Consultants | - |
| ... | ... | ... |

## 🎯 Activity Types

### Consultant-Only Activities
- Consulting
- Clinic
- Training (Billing Days)
- Coaching
- ITP (Individual Training Program)
- BSC - BDRM (Optional)
- BSC - eLearning (Mandatory)
- BSC - New Courses (Mandatory)
- BSC - Certifications (Mandatory)

### General Activities (All Departments)
- Special Projects
- Conference
- Course Outline Support/Design
- Proposal Support
- Vacation
- Sick
- Consultant Support
- Client Support
- Course Materials Design/Audit
- Personal Days Off

## 🔐 Authentication

- **Domain Restriction**: Only @viftraining.com emails can register
- **Password Requirements**: 
  - Minimum 8 characters
  - Must contain uppercase, lowercase, and number
- **Admin Access**: Set via ADMIN_EMAIL environment variable

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🚦 Activity Status Flow

1. **Draft**: Initial state (not implemented yet)
2. **Submitted**: Employee has submitted the activity
3. **Reviewed**: Admin has reviewed the activity
4. **Needs Clarification**: Admin requests more information

## 📈 Analytics Features

- Weekly submission rates
- Department activity distribution
- Employee productivity metrics
- Trend analysis over time
- Export to Excel for custom analysis

## 🔔 Notification System

### Automatic Notifications
- **Thursday Reminders**: Sent to employees who haven't submitted
- **Submission Alerts**: Admin notified when activities are submitted
- **Feedback Notifications**: Employees notified when feedback is provided
- **Clarification Requests**: Alert when more information is needed

## 🛡️ Security Features

- Row Level Security (RLS) policies
- Domain-restricted registration
- Secure authentication with Supabase Auth
- Employee data isolation (can only see own activities)
- Admin-only access to review features

## 📝 Admin Features

### Dashboard Views
1. **Review Tab**: List of activities to review
2. **Analytics Tab**: Charts and metrics
3. **Employee Status Tab**: Submission status overview

### Quarterly Review Process
1. Mark activities for quarterly discussion
2. Filter by quarter
3. Export marked items
4. Conduct review meetings

## 🔧 Maintenance

### Adding New Employees
1. Employee registers with @viftraining.com email
2. System automatically assigns departments based on email
3. Admin can update department assignments in database

### Adding New Departments
1. Add to `departments` table
2. Map activity types in `department_activities`
3. Update employee assignments as needed

### Adding New Activity Types
1. Add to `activity_types` table
2. Set `is_consultant_only` flag if applicable
3. Map to departments in `department_activities`

## 🐛 Troubleshooting

### Common Issues

1. **Login Issues**
   - Verify email domain is @viftraining.com
   - Check Supabase Auth settings
   - Confirm email verification if enabled

2. **Activities Not Showing**
   - Check RLS policies are enabled
   - Verify employee record exists
   - Confirm department assignments

3. **Notifications Not Working**
   - Check notification queries in database
   - Verify recipient IDs are correct
   - Confirm notification templates exist

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Excel Export**: xlsx
- **Icons**: React Icons

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 📞 Support

For issues or questions about the system:
1. Check the troubleshooting section
2. Review Supabase logs
3. Contact system administrator

## 📄 License

This project is proprietary to VIF Training.

---

Built with ❤️ for VIF Training's remote team management needs.
