# ⚡ Quick Start - Run Locally in 5 Minutes

## 🎯 Super Fast Start

```bash
# 1. Go to project folder
cd vif-activity-tracker

# 2. Run the quick start script
node quick-start.js

# Follow the prompts - it will:
# ✅ Check prerequisites
# ✅ Install dependencies
# ✅ Initialize database
# ✅ Test everything
# ✅ Start the server
```

**That's it! Your app will be running on http://localhost:3000**

---

## 📝 Manual Start (If you prefer)

```bash
# Step 1: Install dependencies (1-2 minutes)
npm install

# Step 2: Initialize database with 17 employees (10 seconds)
npm run init-db

# Step 3: Start the server
npm start

# Server is now running on http://localhost:3000
```

---

## 🧪 Run Tests

```bash
# Start the server first:
npm start

# In another terminal, run tests:
npm test

# Or run both with quick-start:
node quick-start.js
# Then choose option 3
```

---

## 👥 Test Accounts

**Admin:**
```
Email: asadeq@viftraining.com
Password: anything
```

**Employee:**
```
Email: omar@viftraining.com
Password: anything
```

*All 17 employees can login with any password!*

---

## 🔧 Useful Commands

```bash
npm start          # Start server (production mode)
npm run dev        # Start with auto-reload (development)
npm test           # Run API tests
npm run init-db    # Reset/initialize database
node quick-start.js # Interactive setup wizard
```

---

## 📚 Need More Help?

- **Complete Guide**: `LOCAL_TESTING_GUIDE.md`
- **API Documentation**: Check `server/routes/` files
- **Deployment**: `GITHUB_SETUP.md` and `REPLIT_SETUP.md`

---

## 🐛 Quick Fixes

**"Cannot find module"**
```bash
npm install
```

**"Port 3000 in use"**
```bash
# Kill the process or use different port:
PORT=3001 npm start
```

**"No users found"**
```bash
npm run init-db
```

---

## ✅ Verify Everything Works

1. ✅ Server starts without errors
2. ✅ Visit http://localhost:3000
3. ✅ Login page appears
4. ✅ Can login with test accounts
5. ✅ API tests pass

---

**Ready to deploy?** Follow `GITHUB_SETUP.md`

**Need details?** Read `LOCAL_TESTING_GUIDE.md`
