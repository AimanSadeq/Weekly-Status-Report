# VIF Activity Tracker - Quick Reference Guide

## Login Credentials (Demo)

| Role | Email | Department |
|------|-------|------------|
| **Admin** | aiman@viftraining.com | Management |
| Employee | ali@viftraining.com | Consultants |
| Employee | ammar@viftraining.com | Consultants |
| Employee | ibrahim@viftraining.com | Consultants |
| Employee | moayad@viftraining.com | Consultants |
| Employee | mufid@viftraining.com | Consultants |
| Employee | wael@viftraining.com | Consultants |
| Employee | yassin@viftraining.com | Consultants |
| Employee | yousef@viftraining.com | Consultants |
| Employee | ahmad@viftraining.com | Operations |
| Employee | alaa@viftraining.com | Operations |
| Employee | dalia@viftraining.com | Operations |
| Employee | rima@viftraining.com | Operations |
| Employee | amal@viftraining.com | Business Development |
| Employee | mj@viftraining.com | Finance |
| Employee | asaad@viftraining.com | Website & Digital Marketing |
| Employee | omar@viftraining.com | Website & Digital Marketing |

**Note:** Any password works in demo mode

---

## Activity Types by Department

### Consultants Department

**Billable Activities:**
- Consulting
- Clinic
- Training (Billing Days)
- Coaching
- ITP

**BSC (Balanced Scorecard) Activities:**
- BSC - BDRM (Optional)
- BSC - eLearning (Mandatory)
- BSC - New Courses (Mandatory)
- BSC - Certifications (Mandatory)

**Plus all General Activities below**

### All Other Departments

**General Activities:**
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

---

## Activity Status Workflow

```
Draft → Submitted → Reviewed
  ↓         ↓          ↓
Delete   No Edit   View Only
```

1. **Draft** - Can be edited and deleted
2. **Submitted** - Locked, awaiting admin review
3. **Reviewed** - Admin has reviewed and provided feedback

---

## Week System

**Work Week:** Sunday to Thursday (5 days)

**Week Selection:**
- Select **Year** (2024, 2025, 2026)
- Select **Week Number** (1-53) OR **Week Ending** (Thursday date)
- Both fields sync automatically

**Example:**
- Week 40: Sun 9/29/2025 - Thu 10/2/2025
- Week Ending: 10/2/2025 (Thursday)

---

## Employee Quick Actions

| Action | Steps |
|--------|-------|
| **Add Activity** | 1. Select Year + Week<br>2. Select Department<br>3. Choose Activity Type<br>4. Enter details<br>5. Click "Add Activity" |
| **Delete Activity** | Click trash icon (draft only) |
| **Submit Week** | Click "Submit Week" button |
| **View Feedback** | Check activity card for blue feedback box |

---

## Admin Quick Actions

| Action | Steps |
|--------|-------|
| **Filter Activities** | Use dropdowns: Year, Week #, Week Ending, Employee, Dept, Status |
| **Review Activity** | Click "Review" button → Add feedback → Save |
| **Reset Filters** | Click "Reset Filters" button |
| **View Reports** | Click "Summary Reports" button |
| **Export CSV** | Click "Export CSV" button |
| **Export Excel** | Click "Export Excel" button |
| **Weekly Report** | Click "Weekly Report" button |

---

## Keyboard Shortcuts

Currently none implemented. Future feature.

---

## Common Questions

### Q: Where is my data stored?
**A:** In browser memory only. Not persistent.

### Q: Can I edit submitted activities?
**A:** No. Only draft activities can be edited.

### Q: Why can't I see activities I added?
**A:** If you logged out and back in as different user, data is lost (no backend).

### Q: How do I add multiple departments?
**A:** Contact admin to update your employee record.

### Q: What's the difference between Units and Percentage?
**A:** 
- **Units**: Quantifiable amount (hours, days, sessions)
- **Percentage**: Completion percentage (0-100%)

### Q: Can I add activities for past weeks?
**A:** Yes, select any available week from the dropdown.

### Q: Who sees my activities?
**A:** Admin can see all activities. Employees only see their own.

---

## Export File Formats

| Format | Contains | Use Case |
|--------|----------|----------|
| **CSV** | All filtered activities | Import to Excel, analysis |
| **Excel** | Formatted spreadsheet | Professional reports |
| **HTML** | Weekly report | Email, print, archive |

**Filename Format:**
- `VIF_Activities_Week40_2025-10-07.csv`
- `VIF_Activities_Week40_2025-10-07.xlsx`
- `VIF_Weekly_Report_Week40_2025-10-07.html`

---

## Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| Draft | Gray | Not yet submitted |
| Submitted | Yellow | Awaiting review |
| Reviewed | Green | Admin reviewed |

---

## Browser Support

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
❌ Internet Explorer (Not supported)

---

## Tips & Best Practices

1. **Submit regularly** - Don't wait until end of month
2. **Be descriptive** - Add clear descriptions to activities
3. **Check feedback** - Review admin feedback on activities
4. **Use correct week** - Ensure you're adding to the right week
5. **Units matter** - Track actual hours/days worked
6. **Percentage** - Use for ongoing projects

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Use @viftraining.com email |
| No activity types | Select department first |
| Week shows N/A | Page refresh issue - reload |
| Export not working | Ensure activities match filters |
| Data disappeared | Expected - no backend persistence |

---

## Getting Help

1. Check **README.md** for detailed info
2. Review **SETUP.md** for installation help
3. See **CHANGELOG.md** for recent changes
4. Check browser console (F12) for errors

---

**Version 1.0.0** | Last Updated: October 7, 2025
