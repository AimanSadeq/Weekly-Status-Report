# VIF Activity Tracker - Setup Guide

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional software required for basic usage
- Optional: Local web server for development

## Installation Steps

### Step 1: Create Project Folder

```bash
mkdir vif-activity-tracker
cd vif-activity-tracker
```

### Step 2: Add Files

Place the following files in the folder:
- `index.html` - Main application
- `README.md` - Documentation

### Step 3: Open the Application

#### Method A: Direct Browser Open
1. Double-click `index.html` or right-click and select "Open with" → your browser
2. The application will load immediately

#### Method B: Local Web Server (Recommended)

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then navigate to: http://localhost:8000

## First Time Usage

### 1. Login as Admin
- Email: `aiman@viftraining.com`
- Password: (any password works in demo mode)
- Click "Sign In"

### 2. Explore Admin Features
- View the dashboard with statistics
- Check the filters (Year, Week Number, Week Ending, Employee, Department, Status)
- Click "Summary Reports" to see analytics
- Try "Export Excel" or "Export CSV" buttons
- Click "Review" on any activity to see the review modal

### 3. Login as Employee
- Logout from admin account
- Email: `omar@viftraining.com` (or any employee email)
- Password: (any password)
- Click "Sign In"

### 4. Add Activities
- Select Year, Week Number, and Week Ending (Thursday)
- Select Department (if you have multiple)
- Choose Activity Type
- Add Description
- Enter Units Completed and % Complete
- Click "Add Activity"

### 5. Submit Activities
- Activities start as "Draft"
- You can delete draft activities using the trash icon
- Click "Submit Week" to submit all draft activities for that week
- Submitted activities cannot be deleted or edited

## Understanding the Week System

The application uses a **Sunday to Thursday work week**:

- **Week Start**: Sunday
- **Week End**: Thursday
- **Week Number**: Based on calendar weeks (1-53)

Example:
- Week 40: Sun 9/29/2025 - Thu 10/2/2025

When adding activities:
1. Select the **Year** first (2024, 2025, 2026)
2. Select **Week Number** (automatically updates Week Ending)
3. Or select **Week Ending** date (automatically updates Week Number)

Both selections are synchronized.

## Testing the Application

### Test Scenario 1: Employee Workflow
1. Login as employee (omar@viftraining.com)
2. Add 3-4 activities for the current week
3. Review them in the activity list
4. Submit the week
5. Check that status changes from "Draft" to "Submitted"

### Test Scenario 2: Admin Workflow
1. Login as admin (aiman@viftraining.com)
2. View all activities in the table
3. Use filters to find specific activities
4. Click "Review" on a submitted activity
5. Add feedback and save
6. Notice the status changes to "Reviewed"

### Test Scenario 3: Export Features
1. Login as admin
2. Apply filters (e.g., select a specific week)
3. Click "Export Excel" - downloads .xlsx file
4. Click "Export CSV" - downloads .csv file
5. Click "Weekly Report" - downloads HTML report
6. Click "Summary Reports" - view analytics modal

## Troubleshooting

### Issue: Activities disappear after logout
**Cause**: No backend database - data stored in browser memory only
**Solution**: This is expected behavior in demo mode. Add localStorage or backend for persistence.

### Issue: Week Number shows "N/A"
**Cause**: Date mismatch or incorrect week data
**Solution**: Ensure activities use Thursday dates (week ending). Already fixed in latest version.

### Issue: Can't login
**Cause**: Email format incorrect
**Solution**: Must use @viftraining.com email addresses. Check available accounts in README.

### Issue: Activity types dropdown is empty
**Cause**: No department selected
**Solution**: Select a department first, then activity types will populate.

### Issue: Export buttons don't work
**Cause**: Browser security or no activities to export
**Solution**: Ensure you have activities matching current filters.

## Customization

### Adding New Employees

Edit the `employees` object in `index.html` (around line 316):

```javascript
const employees = {
  'newemail@viftraining.com': { 
    name: 'New Name', 
    role: 'employee',  // or 'admin'
    departments: ['Department Name']
  },
  // ... existing employees
};
```

### Adding New Departments

Update departments in employee definitions and activity type logic.

### Adding New Activity Types

Edit the `getActivityTypes` function (around line 349):

```javascript
const getActivityTypes = (dept) => {
  const consultantActivities = [
    'New Activity Type',  // Add here
    // ... existing activities
  ];
  // ...
};
```

### Changing Week Start Day

Currently hardcoded to Sunday-Thursday. To change:
1. Modify `generateWeekOptions` function
2. Update week calculation logic
3. Update UI text references

## Production Deployment

⚠️ **This is a demo/prototype.** For production use:

### Required Additions:
1. Backend API (Node.js, Python, PHP, etc.)
2. Database (PostgreSQL, MySQL, MongoDB)
3. Real authentication system
4. Data validation
5. Error handling
6. Security measures (HTTPS, CSRF protection)
7. Session management
8. Email notifications
9. Audit logging

### Recommended:
- Convert to proper React project with build system
- Add unit tests
- Implement CI/CD pipeline
- Use environment variables
- Add monitoring/analytics
- Implement backup system

## Next Steps

1. **Test thoroughly** with all user roles
2. **Gather feedback** from VIF Training team
3. **Plan backend integration** if deploying to production
4. **Document any customizations** you make
5. **Consider security** requirements for real deployment

## Getting Help

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify you're using a supported browser
3. Ensure JavaScript is enabled
4. Try in incognito/private mode
5. Clear browser cache

## Additional Resources

- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- SheetJS Documentation: https://docs.sheetjs.com

---

**Ready to use!** Open `index.html` and start tracking activities.
