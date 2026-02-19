# VIF Activity Tracker - Testing Checklist

Use this checklist to verify all features are working correctly after setup.

---

## ✅ Basic Setup Test

- [ ] Files copied to `vif-activity-tracker` folder
- [ ] `index.html` opens in browser without errors
- [ ] Login page displays correctly
- [ ] No console errors (press F12 to check)

---

## ✅ Employee Features Test

### Login
- [ ] Can login as employee (e.g., omar@viftraining.com)
- [ ] Welcome message shows correct name
- [ ] Employee dashboard loads

### Add Activity
- [ ] Can select Year (2024, 2025, 2026)
- [ ] Can select Week Number (updates Week Ending)
- [ ] Can select Week Ending (updates Week Number)
- [ ] Department dropdown shows (if multi-department user)
- [ ] Activity Type dropdown populates after department selection
- [ ] Can enter description
- [ ] Can enter units completed
- [ ] Can enter percentage complete
- [ ] "Add Activity" button creates new activity
- [ ] Success notification appears

### View Activities
- [ ] Added activity appears in "This Week's Activities" list
- [ ] Activity shows as "Draft" status (gray badge)
- [ ] Activity displays correct information
- [ ] Can see units and percentage in activity card

### Delete Activity
- [ ] Trash icon appears for draft activities
- [ ] Clicking trash icon shows confirmation
- [ ] Confirming deletes the activity
- [ ] Success notification appears

### Submit Week
- [ ] "Submit Week" button appears when draft activities exist
- [ ] Clicking submits all draft activities for selected week
- [ ] Activities change from "Draft" to "Submitted" (yellow badge)
- [ ] Success notification appears
- [ ] Cannot delete submitted activities (no trash icon)

### View Feedback
- [ ] If activity is "Reviewed" (green badge), can see admin feedback
- [ ] Feedback appears in blue box below activity details

### Logout
- [ ] Can logout successfully
- [ ] Returns to login page

---

## ✅ Admin Features Test

### Login
- [ ] Can login as admin (aiman@viftraining.com)
- [ ] Welcome message shows admin name
- [ ] Admin dashboard loads

### Statistics Dashboard
- [ ] "Total Employees" card shows 17
- [ ] "Submitted" count displays correctly
- [ ] "Pending Review" count displays correctly
- [ ] "Reviewed" count displays correctly

### Filters
- [ ] Year dropdown works (2024, 2025, 2026)
- [ ] Week Number dropdown works
- [ ] Week Ending dropdown works
- [ ] Week Number and Week Ending sync when changed
- [ ] Employee dropdown shows all employees
- [ ] Department dropdown shows all departments
- [ ] Status dropdown shows Draft/Submitted/Reviewed
- [ ] Filtering updates the activity table
- [ ] Activity count updates with filters
- [ ] "Reset Filters" button clears all filters

### Activity Table
- [ ] Table shows all activities (when no filters)
- [ ] Table shows filtered activities correctly
- [ ] Can see employee name and email
- [ ] Can see department
- [ ] Can see activity type and description
- [ ] Can see progress (units and percentage)
- [ ] Status badges show correct colors
- [ ] Table rows are hover-highlighted

### Review Activity
- [ ] Can click "Review" button on any activity
- [ ] Review modal opens
- [ ] Modal shows employee name
- [ ] Modal shows department
- [ ] Modal shows **Week Number** (e.g., "Week 40")
- [ ] Modal shows **Week Ending** (e.g., date range)
- [ ] Modal shows activity type
- [ ] Modal shows description (if provided)
- [ ] Modal shows progress
- [ ] Can enter feedback in text area
- [ ] "Cancel" button closes modal
- [ ] "Save Review" button saves and closes
- [ ] Activity status changes to "Reviewed" (green)
- [ ] Success notification appears

### Export CSV
- [ ] "Export CSV" button is visible
- [ ] Clicking downloads a CSV file
- [ ] Filename includes week info and date
- [ ] File contains all filtered activities
- [ ] File can be opened in Excel/Google Sheets
- [ ] Success notification appears

### Export Excel
- [ ] "Export Excel" button is visible
- [ ] Clicking downloads an .xlsx file
- [ ] Filename includes week info and date
- [ ] File contains all filtered activities
- [ ] File has proper formatting and column widths
- [ ] File can be opened in Excel
- [ ] Success notification appears

### Weekly Report
- [ ] "Weekly Report" button is visible
- [ ] Clicking downloads an HTML file
- [ ] File opens in browser
- [ ] Report shows professional formatting
- [ ] Report includes summary statistics
- [ ] Report includes activity details table
- [ ] Report is print-friendly
- [ ] Success notification appears

### Summary Reports
- [ ] "Summary Reports" button is visible
- [ ] Clicking opens reports modal
- [ ] Modal shows "Employee Activity Summary" table
- [ ] Modal shows "Department Performance" table
- [ ] Modal shows "Weekly Completion Rates" table
- [ ] Tables show accurate statistics
- [ ] Completion rate progress bars display
- [ ] Can close modal with X or Close button

### Logout
- [ ] Can logout successfully
- [ ] Returns to login page

---

## ✅ Cross-Browser Test

Test in multiple browsers:

- [ ] **Chrome/Edge** - All features work
- [ ] **Firefox** - All features work
- [ ] **Safari** - All features work

---

## ✅ Responsive Design Test

Test on different screen sizes:

- [ ] **Desktop (1920x1080)** - Layout looks good
- [ ] **Laptop (1366x768)** - Layout looks good
- [ ] **Tablet (768px)** - Layout adapts correctly
- [ ] **Mobile (375px)** - Layout is usable

---

## ✅ Known Limitations Test

Verify expected behavior:

- [ ] Added activities as Employee A are NOT visible to Employee B after logout/login
- [ ] Activities disappear after browser refresh (expected - no database)
- [ ] Cannot edit submitted activities (expected)
- [ ] Cannot delete submitted activities (expected)

---

## ✅ Error Handling Test

- [ ] Trying to login with non-@viftraining.com email shows error
- [ ] Cannot add activity without selecting department
- [ ] Cannot add activity without selecting activity type
- [ ] Week Number shows correctly (not "N/A") in review modal

---

## 🎯 Testing Results

**Date Tested:** ________________

**Tested By:** ________________

**Browser Used:** ________________

**All Tests Passed:** ☐ Yes  ☐ No

**Issues Found:**
```
(List any issues or bugs discovered during testing)








```

**Additional Notes:**
```
(Any other observations or comments)








```

---

## 🐛 Common Issues & Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Login doesn't work | Wrong email format | Use @viftraining.com |
| Week Number shows "N/A" | Old version | Reload page with Ctrl+F5 |
| Activities disappear | Browser refresh | Expected - no backend |
| Can't add activity | Department not selected | Select department first |
| Export doesn't work | No activities match filter | Adjust filters or reset |
| Modal won't open | JavaScript error | Check console (F12) |

---

## ✨ All Tests Passed?

If all tests pass:
1. ✅ Application is working correctly
2. ✅ Ready for user training
3. ✅ Can proceed with deployment planning

If tests fail:
1. 🔍 Check browser console for errors
2. 🔄 Try clearing browser cache
3. 📋 Review SETUP.md for troubleshooting
4. 🆘 Document the issue for support

---

## Next Steps After Testing

1. [ ] Train employees on how to use the system
2. [ ] Train admin on review process and reports
3. [ ] Establish activity submission schedule (weekly/bi-weekly)
4. [ ] Plan for backend integration (if needed)
5. [ ] Schedule regular data exports (if using without backend)

---

**Testing Complete!** 
Report any issues found and proceed with deployment.
