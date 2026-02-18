# Changelog

All notable changes to the VIF Activity Tracker will be documented in this file.

## [1.0.0] - 2025-10-07

### Added
- Initial release of VIF Activity Tracker
- Employee dashboard with activity entry form
- Admin dashboard with comprehensive filtering
- Week-based activity management (Sunday-Thursday work weeks)
- Year, Week Number, and Week Ending synchronized selection
- Activity status workflow (Draft → Submitted → Reviewed)
- Admin review functionality with feedback
- Statistics dashboard with key metrics
- Summary reports with:
  - Employee activity summary
  - Department performance analytics
  - Weekly completion rates
- Export functionality:
  - CSV export
  - Excel export with formatting
  - HTML weekly reports
- 17 employee accounts across multiple departments
- Activity type system with department-specific options
- Responsive design for mobile, tablet, and desktop
- Inline SVG icons (Lucide)
- Success notifications for user actions
- Delete functionality for draft activities

### Departments Supported
- Management
- Consultants
- Operations
- Business Development
- Finance
- Website & Digital Marketing

### Employees
- Aiman (Admin)
- Ali, Ammar, Ibrahim, Moayad, Mufid, Wael, Yassin, Yousef (Consultants)
- Ahmad, Alaa, Dalia, Rima (Operations)
- Amal (Business Development)
- MJ (Finance)
- Asaad, Omar (Website & Digital Marketing)

### Technical Stack
- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel Standalone for JSX transformation
- SheetJS for Excel export
- Single-file HTML application

### Known Limitations
- No backend database (data stored in browser memory)
- No data persistence between sessions
- Activities lost on page refresh
- No real authentication system
- Demo mode only

---

## Future Releases (Planned)

### [2.0.0] - Backend Integration (Planned)
- Add Node.js/Express backend
- PostgreSQL database integration
- Real authentication with JWT
- Session persistence
- API endpoints for CRUD operations

### [2.1.0] - Enhanced Features (Planned)
- Email notifications for submitted/reviewed activities
- Real-time updates
- Activity history and audit logs
- Advanced analytics with charts
- Bulk operations
- Activity templates
- Comments/discussion threads

### [2.2.0] - UX Improvements (Planned)
- Dark mode
- Keyboard shortcuts
- Activity search functionality
- Drag-and-drop reordering
- Activity duplication
- Custom activity types
- Department customization

### [3.0.0] - Enterprise Features (Planned)
- Multi-tenant support
- Role-based access control (RBAC)
- Custom reporting builder
- Integration with calendar systems
- Mobile app (iOS/Android)
- SSO/LDAP authentication
- API for third-party integrations
- Automated backups

---

## Version History

**Version 1.0.0** - Initial Demo Release
- Released: October 7, 2025
- Status: Demo/Prototype
- Lines of Code: ~1,968
- File Size: ~85 KB

---

## Maintenance Notes

### Recent Fixes (October 7, 2025)
1. Fixed week number display in admin review modal
   - Issue: Week number showing as "N/A"
   - Solution: Added `calculateWeekNumber()` helper function and robust fallback logic
   - Updated mock data to use correct Thursday week-ending dates

2. Added missing employees
   - Added: Alaa (Operations), Wael (Consultants)
   - Total employees: 17

3. Synchronized week selection dropdowns
   - Year, Week Number, and Week Ending now sync automatically
   - Admin filters use separate week options with all weeks from start of year

### Development Notes
- Use `generateWeekOptions(year, startFromBeginning)` for week generation
- Admin filters should always use `startFromBeginning: true`
- Employee view can optimize with `startFromBeginning: false`
- Week ending dates must be Thursdays for proper lookup

---

For questions or issues, review the README.md and SETUP.md files.
