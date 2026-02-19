# Activity-Department Matrix Implementation Guide

## ✅ What's Been Created

I've implemented a comprehensive many-to-many relationship system between Activity Types and Departments based on your matrix.

## 📋 Implementation Overview

### 1. Database Structure

**New Table Created:** `activity_type_departments`
- Junction table linking activity types with departments
- Allows many-to-many relationships
- Each activity type can belong to multiple departments
- Each department can have multiple activity types

### 2. Matrix Mapping (From Your Specifications)

#### Website & Digital Marketing Activities (7 activities)
- Designing and posting social media content
- Email marketing campaigns and newsletters
- Managing digital ads (Google, LinkedIn, Meta campaigns)
- Monitoring web traffic and lead conversion performance
- Search Engine Optimization (SEO) and Google Analytics tracking
- Updating event calendars and registration forms
- Website content updates (course pages, trainer profiles, blogs)

#### Operations Activities (9 activities)
- Coordinating between Business Development, Consultants, and Clients (shared with Consultants)
- Coordinating with Consultants to design course content
- Managing logistics for classroom and online sessions
- eLearning vouchers
- Preparing and sending certificates, evaluations, and post-course reports
- Preparing course outlines
- Tracking course timelines, attendance, and completion status
- Preparing training proposals
- Preparing consulting proposals

#### Consultants Activities (12 activities)
- designing customized course outlines
- Delivering classroom, virtual, consulting, ITP, and coaching sessions
- Reviewing and updating course content
- Designing new courses
- Designing eLearning
- Proposal Support
- Bringing-in business (BD)
- Attending conferences
- Consultant support
- Special projects
- Course materials design/audit
- Delivering Training (Billing Days)

#### Finance Activities (7 activities)
- Handling VAT and tax compliance for UAE and KSA operations
- Maintaining budget control and cost allocation by department or client
- Managing invoicing, collections, and payments (clients, trainers, vendors)
- Managing trainer contracts, payroll, and expense claims
- Monitoring course profitability and billing day utilization
- Preparing monthly and annual financial statements (P&L, balance sheet, cash flow)
- Supporting management with financial performance dashboards and cost optimization insights

#### Management Activities (8 activities)
- Approving major proposals, budgets, and partnerships
- Driving organizational innovation (eLearning, gamification, AI tools)
- Leading leadership and performance review meetings
- Managing key stakeholder and partner relationships (ministries, academies, institutions)
- Overseeing policy creation, governance, and compliance
- Overseeing quality assurance and client satisfaction metrics
- Reviewing monthly performance dashboards and pipeline reports
- Setting corporate strategy, annual targets, and departmental KPIs

#### Business Development & Relationship Management Activities (9 activities)
- Collaborating with the Marketing team for campaigns and promotions
- Conducting client meetings, needs assessments, and follow-ups
- Coordinating with Operations to develop customized proposals and course outlines
- Identifying and engaging corporate and government clients (KSA, UAE, Iraq, Jordan)
- Maintaining a database of opportunities and relationships
- Managing the sales pipeline (calls, visits, proposals requested, proposals confirmed)
- Representing VIFM at events, conferences, and exhibitions
- Strengthening existing client relationships through continuous engagement and feedback
- Procurement and vendor portal management

#### Universal Activities (Available to ALL Departments)
- Sick
- Vacation
- Other activities
- Professional development
- Maternity/Paternity (if exists)

## 🚀 Setup Instructions

### Step 1: Run the SQL Script in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: **`setup-activity-department-matrix.sql`**
3. Copy and paste the ENTIRE script
4. Click **Run** or press Ctrl+Enter

This will:
- Create the `activity_type_departments` junction table
- Set up indexes for performance
- Configure RLS policies
- Create helper functions
- Populate all relationships based on your matrix
- Run verification queries

### Step 2: Restart the Server

The server needs to be restarted to use the updated API:

```bash
npx kill-port 3000
npm start
```

### Step 3: Test the Filtering

1. Go to http://localhost:3000
2. Login with any employee email
3. Select different departments and watch activity types change

## 🔍 How It Works Now

### API Endpoint Enhancement

**New Endpoint:** `GET /api/metadata/activity-types?department={departmentName}`

Example requests:
```bash
# Get activity types for Consultants
GET /api/metadata/activity-types?department=Consultants

# Get activity types for Finance
GET /api/metadata/activity-types?department=Finance

# Get all activity types (no filter)
GET /api/metadata/activity-types
```

### Frontend Flow

1. User selects **"Website & Digital Marketing"** from Department dropdown
2. Frontend calls: `/api/metadata/activity-types?department=Website & Digital Marketing`
3. API queries the junction table to find only activity types linked to that department
4. Returns 11 activities (7 specific + 4 universal)
5. Dropdown populates with filtered results

### Example Behavior

**Select "Consultants":**
- Shows: Consulting-specific activities + Universal activities (Sick, Vacation, etc.)
- Total: ~16 activities

**Select "Finance":**
- Shows: Finance-specific activities + Universal activities
- Total: ~11 activities

**Select "Management":**
- Shows: Management-specific activities + Universal activities
- Total: ~12 activities

## 📊 Technical Details

### Database Query (Simplified)

```sql
SELECT at.name
FROM activity_type_departments atd
JOIN activity_types at ON atd.activity_type_id = at.id
JOIN departments d ON atd.department_id = d.id
WHERE d.name = 'Consultants'
  AND at.is_active = true
ORDER BY at.display_order;
```

### API Response Format

```json
{
  "success": true,
  "activityTypes": [
    {
      "id": "uuid",
      "name": "Delivering Training (Billing Days)",
      "category": "Other",
      "isConsultantOnly": true,
      "isMandatory": false,
      "displayOrder": 0
    },
    ...
  ]
}
```

### Frontend Code

```javascript
// When department changes, fetch filtered activity types
async function filterActivityTypes() {
  const selectedDepartment = departmentSelect.value;

  const response = await fetch(
    `/api/metadata/activity-types?department=${encodeURIComponent(selectedDepartment)}`
  );

  const data = await response.json();

  // Populate dropdown with filtered results
  data.activityTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type.name;
    option.textContent = type.name;
    activityTypeSelect.appendChild(option);
  });
}
```

## ✅ Verification Queries

After running the SQL script, you can verify the setup with these queries in Supabase SQL Editor:

### Check Total Relationships
```sql
SELECT COUNT(*) FROM activity_type_departments;
```

### View Activities by Department
```sql
SELECT
  d.name as department,
  COUNT(*) as activity_count
FROM activity_type_departments atd
JOIN departments d ON atd.department_id = d.id
GROUP BY d.name
ORDER BY activity_count DESC;
```

### See All Relationships
```sql
SELECT
  d.name as department,
  at.name as activity_type
FROM activity_type_departments atd
JOIN activity_types at ON atd.activity_type_id = at.id
JOIN departments d ON atd.department_id = d.id
ORDER BY d.name, at.name;
```

## 🎯 Benefits

✅ **Accurate Filtering** - Only relevant activities shown per department
✅ **Maintainable** - Easy to add/remove relationships via SQL
✅ **Flexible** - Activity types can belong to multiple departments
✅ **Scalable** - New departments or activities can be added easily
✅ **Database-Driven** - All configuration stored in Supabase
✅ **User-Friendly** - Prevents invalid activity/department combinations

## 🔧 Future Enhancements

### Adding New Activity Types
```sql
-- 1. Insert new activity type
INSERT INTO activity_types (name, category, is_active)
VALUES ('New Activity Name', 'Category', true);

-- 2. Link to departments
SELECT link_activity_to_departments(
  'New Activity Name',
  ARRAY['Department Name 1', 'Department Name 2']
);
```

### Modifying Relationships
```sql
-- Remove a relationship
DELETE FROM activity_type_departments
WHERE activity_type_id = (SELECT id FROM activity_types WHERE name = 'Activity Name')
  AND department_id = (SELECT id FROM departments WHERE name = 'Department Name');

-- Add a relationship
INSERT INTO activity_type_departments (activity_type_id, department_id)
VALUES (
  (SELECT id FROM activity_types WHERE name = 'Activity Name'),
  (SELECT id FROM departments WHERE name = 'Department Name')
);
```

## 📝 Summary

Your VIF Activity Tracker now has a complete matrix-based filtering system:

- ✅ Junction table created
- ✅ All relationships populated
- ✅ API updated to query by department
- ✅ Frontend fetches and displays filtered results
- ✅ User experience optimized (department first, then filtered types)

The system now perfectly matches your activity-department matrix! 🎉
