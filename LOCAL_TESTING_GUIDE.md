# 🧪 VIF Activity Tracker - Local Testing Guide

**Complete Guide to Running and Testing on Your Computer**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 Minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing the Backend](#testing-the-backend)
5. [Testing with Frontend](#testing-with-frontend)
6. [Test Accounts](#test-accounts)
7. [API Testing](#api-testing)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## 🔧 Prerequisites

Before you start, make sure you have:

### Required:
- ✅ **Node.js** (version 16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- ✅ **npm** (comes with Node.js, version 8 or higher)
  - Check: `npm --version`

### Optional but Recommended:
- 📝 **Code Editor** (VS Code, Sublime, etc.)
- 🧪 **API Testing Tool** (Postman, Insomnia, or cURL)
- 🌐 **Modern Browser** (Chrome, Firefox, Edge)

### Check Your Setup:
```bash
# Run these commands to verify:
node --version    # Should show v16.x.x or higher
npm --version     # Should show 8.x.x or higher
```

---

## ⚡ Quick Start (5 Minutes)

**Get up and running in 5 steps:**

### Step 1: Navigate to Project
```bash
cd vif-activity-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```
⏱️ *Takes ~1-2 minutes*

### Step 3: Initialize Database
```bash
node server/init-db.js
```
⏱️ *Takes ~10 seconds*

You should see:
```
🔧 Initializing VIF Activity Tracker Database...

Creating employees...
✅ Created user: Aiman (asadeq@viftraining.com)
✅ Created user: Omar (omar@viftraining.com)
... (17 employees total)

✅ Database initialization complete!
📊 Total employees: 17

🚀 You can now start the server with: npm start
```

### Step 4: Start the Server
```bash
npm start
```

You should see:
```
🚀 VIF Activity Tracker Server running on port 3000
📊 Environment: development
🔗 API available at: http://localhost:3000/api
```

### Step 5: Open in Browser
```bash
# Open your browser and go to:
http://localhost:3000
```

**🎉 You're running locally!**

---

## 📖 Detailed Setup

### Step-by-Step Installation

#### 1. Extract the Project
```bash
# If you downloaded a zip file:
unzip vif-activity-tracker.zip
cd vif-activity-tracker

# Or if you cloned from GitHub:
git clone https://github.com/yourusername/vif-activity-tracker.git
cd vif-activity-tracker
```

#### 2. Verify Project Structure
```bash
# Check that you have these folders:
ls -la

# You should see:
# - server/          (Backend code)
# - src/             (React frontend)
# - public/          (Static files)
# - docs/            (Documentation)
# - package.json     (Dependencies)
```

#### 3. Install All Dependencies
```bash
npm install
```

**What gets installed:**
- Express.js - Web server framework
- Replit Database - Data storage
- CORS - Cross-origin support
- Helmet - Security headers
- SendGrid - Email service (optional)
- And more...

**Troubleshooting Installation:**
```bash
# If you get permission errors (Mac/Linux):
sudo npm install

# If you get EACCES errors:
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install

# If npm is outdated:
npm install -g npm@latest

# Clear cache if things are stuck:
npm cache clean --force
npm install
```

#### 4. Create Environment File (Optional)
```bash
# Copy the example file:
cp .env.example .env

# Edit .env with your settings (optional for local testing):
# PORT=3000
# NODE_ENV=development
# SENDGRID_API_KEY=your_key_here  (optional)
```

For local testing, the default settings work fine!

#### 5. Initialize the Database
```bash
node server/init-db.js
```

**What this does:**
- Creates all 17 VIF employees in the database
- Sets up default email preferences
- Prepares the system for use

**Important Notes:**
- ⚠️ Run this ONLY ONCE when setting up
- ✅ Safe to run multiple times (won't duplicate users)
- 📊 Creates users with these roles:
  - 1 Admin (Aiman)
  - 16 Employees

---

## 🧪 Testing the Backend

### Test 1: Health Check
```bash
# Start the server:
npm start

# In another terminal, test the health endpoint:
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-10-03T19:30:00.000Z",
#   "environment": "development"
# }
```

### Test 2: Login Endpoint
```bash
# Test admin login:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asadeq@viftraining.com","password":"test123"}'

# Expected response:
# {
#   "success": true,
#   "user": {
#     "email": "asadeq@viftraining.com",
#     "name": "Aiman",
#     "role": "admin",
#     "departments": ["Management", "Consultants"]
#   }
# }
```

### Test 3: Get All Users
```bash
curl http://localhost:3000/api/users

# Expected: Array of 17 employees
```

### Test 4: Create an Activity
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "email": "omar@viftraining.com",
    "department": "Consultants",
    "activityType": "Training (Billing Days)",
    "unitsCompleted": 8,
    "percentageComplete": 100,
    "description": "Conducted leadership training",
    "week": "2025-10-03"
  }'

# Expected: Activity created with ID
```

### Test 5: Get Activities
```bash
# Get all activities for an employee:
curl "http://localhost:3000/api/activities?email=omar@viftraining.com&role=employee"

# Expected: Array of activities
```

---

## 🎨 Testing with Frontend

### Backend-Only Testing (Current Setup)

The current setup runs the **backend API only**. The React component needs to be integrated for full UI testing.

**What works now:**
- ✅ All API endpoints
- ✅ Database operations
- ✅ User authentication
- ✅ Activity management
- ✅ Email system (if configured)

### Access the App

1. **Start the server:**
```bash
npm start
```

2. **Open browser:**
```
http://localhost:3000
```

3. **What you'll see:**
- Basic HTML page
- Can test API endpoints via console or tools

### Testing with API Tools

**Using Postman:**
1. Import this collection or create requests manually
2. Base URL: `http://localhost:3000/api`
3. Test all endpoints listed below

**Using cURL:**
See examples in the [API Testing](#api-testing) section below.

**Using Browser Console:**
```javascript
// Test login from browser console:
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'omar@viftraining.com',
    password: 'test'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## 👥 Test Accounts

### Admin Account
```
Email: asadeq@viftraining.com
Role: admin
Departments: Management, Consultants
Password: Any password works (no real auth for demo)
```

**Admin can:**
- View all activities
- Review and approve submissions
- Add feedback to activities
- See statistics dashboard
- Manage all employees

### Employee Accounts

**Consultants:**
```
omar@viftraining.com      (Omar - Website & Digital Marketing, Consultants)
ahmadg@viftraining.com    (Ahmad - Operations, Consultants)
akayed@viftraining.com    (Amal - BDRM, Consultants)
ali@viftraining.com       (Ali - Consultants)
ammar@viftraining.com     (Ammar - Consultants)
ibrahim@viftraining.com   (Ibrahim - Consultants)
moayad@viftraining.com    (Moayad - Consultants)
mufid@viftraining.com     (Mufid - Consultants)
yassin@viftraining.com    (Yassin - Consultants)
wael@viftraining.com      (Wael - Consultants)
yousef@viftraining.com    (Yousef - Consultants)
```

**Operations:**
```
ajubain@viftraining.com   (Alaa - Operations)
dalia@viftraining.com     (Dalia - Operations)
rima@viftraining.com      (Rima - Operations)
```

**Other Departments:**
```
mohamad@viftraining.com   (MJ - Finance)
asaad@viftraining.com     (Asaad - Website & Digital Marketing)
```

**Employees can:**
- Add their own activities
- View their activities
- Submit weekly reports
- See admin feedback

---

## 🔌 API Testing

### Complete API Reference

#### Authentication Endpoints

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "omar@viftraining.com",
  "password": "test"
}

Response:
{
  "success": true,
  "user": { ... }
}
```

**Logout**
```bash
POST /api/auth/logout
Content-Type: application/json

{
  "email": "omar@viftraining.com"
}
```

**Check Authentication**
```bash
GET /api/auth/check?email=omar@viftraining.com

Response:
{
  "authenticated": true,
  "user": { ... }
}
```

---

#### Activity Endpoints

**Get All Activities (with filters)**
```bash
GET /api/activities?email=omar@viftraining.com&role=employee

Query Parameters:
- email: User's email
- role: 'admin' or 'employee'
- week: '2025-10-03' (optional)
- status: 'draft', 'submitted', 'reviewed' (optional)
- department: Filter by department (optional)
```

**Get Single Activity**
```bash
GET /api/activities/:id
```

**Create Activity**
```bash
POST /api/activities
Content-Type: application/json

{
  "email": "omar@viftraining.com",
  "department": "Consultants",
  "activityType": "Training (Billing Days)",
  "unitsCompleted": 8,
  "percentageComplete": 100,
  "description": "Leadership training session",
  "week": "2025-10-03",
  "bscCategory": ""
}
```

**Update Activity**
```bash
PUT /api/activities/:id
Content-Type: application/json

{
  "unitsCompleted": 10,
  "percentageComplete": 100
}
```

**Delete Activity**
```bash
DELETE /api/activities/:id
```

**Submit Week**
```bash
POST /api/activities/submit-week
Content-Type: application/json

{
  "email": "omar@viftraining.com",
  "week": "2025-10-03"
}
```

**Admin Review**
```bash
POST /api/activities/:id/review
Content-Type: application/json

{
  "adminEmail": "asadeq@viftraining.com",
  "feedback": "Great work!",
  "status": "reviewed"
}
```

**Get Statistics**
```bash
GET /api/activities/stats/summary?week=2025-10-03
```

---

#### User Endpoints

**Get All Users**
```bash
GET /api/users
```

**Get Single User**
```bash
GET /api/users/:email
```

**Create User**
```bash
POST /api/users
Content-Type: application/json

{
  "email": "newuser@viftraining.com",
  "name": "New User",
  "role": "employee",
  "departments": ["Operations"]
}
```

**Update User**
```bash
PUT /api/users/:email
Content-Type: application/json

{
  "name": "Updated Name",
  "departments": ["Operations", "Consultants"]
}
```

**Email Preferences**
```bash
GET /api/users/:email/email-preferences
PUT /api/users/:email/email-preferences
```

---

#### Email Endpoints (Optional - requires SendGrid)

**Test Email**
```bash
POST /api/email/test
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email"
}
```

**Send Deadline Reminder**
```bash
POST /api/email/deadline-reminder
Content-Type: application/json

{
  "to": "omar@viftraining.com",
  "name": "Omar",
  "deadline": "Thursday, October 3, 2025"
}
```

**Other Email Types:**
- `/api/email/submission-confirmation`
- `/api/email/feedback-notification`
- `/api/email/weekly-digest`
- `/api/email/admin-alert`

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot find module 'express'"
```bash
Solution:
cd vif-activity-tracker
npm install
```

#### Issue: "Port 3000 is already in use"
```bash
Solution:

# Option 1: Kill the process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill

# Option 2: Use a different port
PORT=3001 npm start
```

#### Issue: "Database is empty / No users found"
```bash
Solution:
node server/init-db.js
```

#### Issue: "EACCES: permission denied"
```bash
Solution:
# Mac/Linux - fix npm permissions:
sudo chown -R $USER ~/.npm
sudo chown -R $USER /usr/local/lib/node_modules

# Or use nvm (Node Version Manager)
```

#### Issue: "Module not found after install"
```bash
Solution:
# Clear cache and reinstall:
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

#### Issue: "Cannot connect to database"
```bash
Solution:
# Replit Database works locally via file storage
# Just make sure init-db.js ran successfully
node server/init-db.js

# Check if .replit-db folder exists
ls -la
```

#### Issue: "API returns 404"
```bash
Solution:
# Make sure server is running:
npm start

# Check the correct endpoint:
# ✅ http://localhost:3000/api/health
# ❌ http://localhost:3000/health (missing /api)
```

#### Issue: "CORS errors in browser"
```bash
Solution:
# CORS is already configured in server/index.js
# If you still see errors, check:
# 1. Server is running on localhost:3000
# 2. You're accessing from localhost (not 127.0.0.1)
# 3. No browser extensions blocking requests
```

#### Issue: "npm start does nothing"
```bash
Solution:
# Check package.json has start script
cat package.json | grep "start"

# Should see: "start": "node server/index.js"

# Try running directly:
node server/index.js
```

---

## 🔍 Debugging Tips

### Enable Detailed Logging
```bash
# Set to development mode:
NODE_ENV=development npm start

# Or create .env file:
NODE_ENV=development
PORT=3000
```

### Check Server Logs
```bash
# Server logs appear in the terminal where you ran npm start
# Look for:
# - ✅ Success messages
# - ⚠️ Warnings
# - ❌ Errors
```

### Test Individual Components

**Test Database:**
```bash
node -e "const db = require('./server/models/db'); db.getAllUsers().then(console.log)"
```

**Test Routes:**
```bash
# In a Node REPL:
node
> const authRoutes = require('./server/routes/auth')
> // Test route logic
```

### Browser DevTools
```
F12 (or Cmd+Option+I on Mac)
- Console: See JavaScript errors
- Network: See API requests/responses
- Application: Check local storage
```

---

## 📊 Verify Everything Works

### Complete Test Checklist

Run through this checklist to verify everything works:

- [ ] **Installation**
  - [ ] Node.js and npm installed
  - [ ] Dependencies installed (`npm install`)
  - [ ] No error messages

- [ ] **Database**
  - [ ] Ran `node server/init-db.js`
  - [ ] Saw 17 employees created
  - [ ] No error messages

- [ ] **Server**
  - [ ] Server starts with `npm start`
  - [ ] Sees "Server running on port 3000"
  - [ ] No crash or errors

- [ ] **API - Health Check**
  - [ ] `curl http://localhost:3000/api/health` works
  - [ ] Returns `{"status":"ok"}`

- [ ] **API - Authentication**
  - [ ] Can login with admin account
  - [ ] Can login with employee account
  - [ ] Returns user object

- [ ] **API - Users**
  - [ ] Can get all users
  - [ ] Returns 17 employees
  - [ ] Can get single user

- [ ] **API - Activities**
  - [ ] Can create activity
  - [ ] Can get activities
  - [ ] Can update activity
  - [ ] Can delete activity

- [ ] **Browser**
  - [ ] Can open http://localhost:3000
  - [ ] Page loads without errors
  - [ ] API calls work from console

---

## 🎯 Performance Benchmarks

**Expected Performance (Local):**

- Server start: < 2 seconds
- API response: < 50ms
- Database queries: < 10ms
- Page load: < 1 second

**Test Performance:**
```bash
# Install Apache Bench (optional):
# Mac: brew install apache-bench
# Ubuntu: apt-get install apache2-utils

# Run benchmark:
ab -n 1000 -c 10 http://localhost:3000/api/health

# Results should show:
# - Requests per second: 500+
# - Time per request: < 20ms
```

---

## 🚀 Next Steps

### After Local Testing Succeeds:

1. **✅ Everything Works?**
   - Proceed to GitHub push
   - Follow `GITHUB_SETUP.md`

2. **🎨 Want to Customize?**
   - Modify activity types
   - Change branding/colors
   - Add more employees

3. **🌐 Ready to Deploy?**
   - Push to GitHub
   - Import to Replit
   - Follow `REPLIT_SETUP.md`

4. **📧 Enable Emails?**
   - Get SendGrid API key
   - Add to .env file
   - Test email endpoints

5. **🔒 Production Setup?**
   - Set NODE_ENV=production
   - Configure real authentication
   - Set up monitoring

---

## 📝 Quick Command Reference

```bash
# Installation
npm install

# Database
node server/init-db.js

# Start server
npm start

# Start with nodemon (auto-restart on changes)
npm run dev

# Test health
curl http://localhost:3000/api/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"omar@viftraining.com","password":"test"}'

# Get all users
curl http://localhost:3000/api/users

# Create activity
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "email":"omar@viftraining.com",
    "department":"Consultants",
    "activityType":"Training (Billing Days)",
    "unitsCompleted":8,
    "percentageComplete":100,
    "description":"Test activity",
    "week":"2025-10-03"
  }'
```

---

## 🎊 You're Ready!

If you've completed this guide, you now have:

✅ **Working backend** running locally  
✅ **All 17 employees** in database  
✅ **API endpoints** tested and working  
✅ **Confidence** to deploy to production  

**Next:** Follow `GITHUB_SETUP.md` to push to GitHub and deploy to Replit!

---

## 📞 Additional Resources

- **Documentation**: Check the `docs/` folder
- **GitHub Setup**: `GITHUB_SETUP.md`
- **Replit Setup**: `REPLIT_SETUP.md`
- **API Reference**: See route files in `server/routes/`
- **Express Docs**: https://expressjs.com
- **Node.js Docs**: https://nodejs.org/docs

---

**Made with ❤️ for VIF Training**

*Local Testing Guide - Complete and Ready to Use*

---

## 🔄 Version History

- **v2.0** - Complete backend implementation
- **v1.0** - Initial React frontend

**Last Updated:** October 3, 2025
