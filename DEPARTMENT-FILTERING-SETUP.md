# Department Filtering by Employee Assignment

## Overview
The VIF Activity Tracker now filters departments based on each employee's assigned departments (primary and secondary).

## What's Been Implemented

### 1. **Database Structure**
Created a new junction table `employee_departments` to manage the many-to-many relationship between employees and departments.

**Schema:**
```sql
employee_departments (
  id UUID,
  employee_id UUID → employees(id),
  department_id UUID → departments(id),
  is_primary BOOLEAN,
  created_at TIMESTAMP
)
```

### 2. **Employee-Department Assignments**

| Employee | Primary Department | Secondary Department |
|----------|-------------------|---------------------|
| Aiman    | Consultants       | Management          |
| Omar     | Website & Digital Marketing | - |
| Ahmad    | Operations        | Consultants         |
| Amal     | Business Development & RM | Consultants |
| Alaa     | Operations        | -                   |
| Rima     | Operations        | -                   |
| Dalia    | Operations        | -                   |
| Yousef   | Operations        | -                   |
| MJ       | Finance           | -                   |
| Ibrahim  | Consultants       | -                   |
| Ammar    | Consultants       | -                   |
| Moayad   | Consultants       | -                   |
| Yassin   | Consultants       | -                   |
| Ali      | Consultants       | -                   |
| Mufid    | Consultants       | -                   |
| Wael     | Business Development & RM | - |
| Asaad    | Website & Digital Marketing | - |

### 3. **API Updates**

**Updated Endpoint:** `/api/metadata/all?email={employee_email}`

Now returns only the departments assigned to the specified employee.

**Example:**
```javascript
// Aiman logs in
GET /api/metadata/all?email=asadeq@viftraining.com

// Returns:
{
  "success": true,
  "departments": [
    { "name": "Consultants" },      // Primary
    { "name": "Management" }         // Secondary
  ],
  "activityTypes": [...]
}
```

### 4. **Frontend Updates**

The frontend now:
1. Passes the logged-in user's email to the metadata API
2. Shows only their assigned departments in the dropdown
3. Displays an error message if no departments are assigned

## Setup Instructions

### Step 1: Run the Employee SQL Script
```bash
# In Supabase SQL Editor, run:
add-all-employees.sql
```

This adds all 17 employees to the database.

### Step 2: Run the Department Assignment Script
```bash
# In Supabase SQL Editor, run:
assign-employee-departments.sql
```

This:
- Creates the `employee_departments` junction table
- Assigns each employee to their primary and secondary departments
- Sets up proper foreign keys and indexes

### Step 3: Verify the Setup
```sql
-- Check employee-department assignments
SELECT
  e.full_name,
  e.email,
  d.name as department,
  CASE WHEN ed.is_primary THEN 'Primary' ELSE 'Secondary' END as role
FROM employee_departments ed
JOIN employees e ON ed.employee_id = e.id
JOIN departments d ON ed.department_id = d.id
ORDER BY e.full_name, ed.is_primary DESC;
```

## How It Works

### When an Employee Logs In:

1. **Login** → User authenticates with email
2. **Load Metadata** → Frontend calls `/api/metadata/all?email={user.email}`
3. **Filter Departments** → API queries `employee_departments` table
4. **Show Only Assigned** → Dropdown shows only their departments
5. **Select Department** → Activity types filtered by selected department

### Example User Flow:

**Aiman (Consultants + Management):**
1. Logs in with `asadeq@viftraining.com`
2. Department dropdown shows:
   - Consultants
   - Management
3. Selects "Consultants"
4. Activity types filtered to show Consultant-related activities

**Omar (Website & Digital Marketing only):**
1. Logs in with `omar@viftraining.com`
2. Department dropdown shows:
   - Website & Digital Marketing
3. Selects "Website & Digital Marketing"
4. Activity types filtered to show Website-related activities

## Files Created/Modified

### New Files:
- `assign-employee-departments.sql` - Employee-department assignment script

### Modified Files:
- `server/routes/metadata.js` - Updated `/all` endpoint to filter by employee
- `public/index.html` - Updated to pass email and handle filtered departments

## Testing

1. **Test with Aiman (2 departments):**
   ```bash
   Login: asadeq@viftraining.com
   Expected: See "Consultants" and "Management" in dropdown
   ```

2. **Test with Omar (1 department):**
   ```bash
   Login: omar@viftraining.com
   Expected: See only "Website & Digital Marketing" in dropdown
   ```

3. **Test with Ahmad (2 departments):**
   ```bash
   Login: ahmadg@viftraining.com
   Expected: See "Operations" and "Consultants" in dropdown
   ```

## Troubleshooting

### Issue: "No departments assigned" message
**Solution:** Run `assign-employee-departments.sql` in Supabase

### Issue: All departments showing instead of filtered
**Solution:** Check that:
1. `employee_departments` table exists
2. Employee has entries in `employee_departments`
3. Email parameter is being passed correctly in API call

### Issue: Department dropdown empty
**Solution:**
1. Verify employee exists in `employees` table
2. Check that departments are marked as `is_active = true`
3. Ensure RLS policies allow reading from `employee_departments`

## Benefits

✅ **Security**: Employees can only see and work with their assigned departments
✅ **Clarity**: No confusion about which department to select
✅ **Accuracy**: Activity types automatically filtered to relevant departments
✅ **Flexibility**: Supports multiple department assignments per employee
✅ **Scalability**: Easy to add/remove department assignments

## Next Steps

To add/modify department assignments:

```sql
-- Add a department to an employee
SELECT assign_employee_to_department(
  'email@viftraining.com',
  'Department Name',
  true  -- is_primary
);

-- Remove a department from an employee
DELETE FROM employee_departments
WHERE employee_id = (SELECT id FROM employees WHERE email = 'email@viftraining.com')
  AND department_id = (SELECT id FROM departments WHERE name = 'Department Name');
```

---

**Status:** ✅ Ready to Use
**Last Updated:** 2025-10-20
**Version:** 1.0
