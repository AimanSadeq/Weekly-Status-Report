# 🔧 Replit Setup Guide
## Complete Instructions for VIF Activity Tracker

---

## 📋 What You'll Need

- GitHub account
- Replit account (free tier works fine)
- 15 minutes of time
- (Optional) SendGrid account for emails

---

## 🚀 Step-by-Step Setup

### Step 1: Push to GitHub

First, get your code into GitHub:

1. **Create New Repository on GitHub:**
   - Go to [github.com/new](https://github.com/new)
   - Name: `vif-activity-tracker`
   - Description: "VIF Training Employee Activity Tracking System"
   - Choose: Public or Private
   - Click "Create repository"

2. **Push Your Code:**
   ```bash
   # In your local project directory
   git init
   git add .
   git commit -m "Initial commit - VIF Activity Tracker v2.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vif-activity-tracker.git
   git push -u origin main
   ```

---

### Step 2: Import to Replit

1. **Go to Replit:**
   - Visit [replit.com](https://replit.com)
   - Sign in or create account

2. **Create New Repl:**
   - Click "+ Create Repl" button
   - Select "Import from GitHub"

3. **Connect GitHub:**
   - Authorize Replit to access your GitHub
   - Select the repository: `YOUR_USERNAME/vif-activity-tracker`
   - Click "Import from GitHub"

4. **Replit Will Automatically:**
   - Detect Node.js project
   - Read `.replit` configuration
   - Install dependencies from `package.json`
   - Set up the environment

---

### Step 3: Initialize Database

Once your Repl is created:

1. **Open Shell Tab** (bottom of screen)

2. **Run Database Initialization:**
   ```bash
   node server/init-db.js
   ```

3. **You Should See:**
   ```
   🔧 Initializing VIF Activity Tracker Database...

   Creating employees...
   ✅ Created user: Aiman (asadeq@viftraining.com)
   ✅ Created user: Omar (omar@viftraining.com)
   ... (17 employees total)

   Setting up email preferences...
   ✅ Email preferences set for: Aiman
   ... (17 employees total)

   ✅ Database initialization complete!
   📊 Total employees: 17

   🚀 You can now start the server with: npm start
   ```

---

### Step 4: Configure Environment (Optional)

Email notifications are optional but recommended:

1. **Get SendGrid API Key:**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free account (100 emails/day free)
   - Navigate to Settings > API Keys
   - Click "Create API Key"
   - Name it: "VIF Activity Tracker"
   - Choose "Full Access"
   - Copy the generated key

2. **Add to Replit Secrets:**
   - In your Repl, click the 🔒 **Secrets** icon (left sidebar)
   - Click "+ New Secret"
   
   **Add these secrets:**
   - Key: `SENDGRID_API_KEY`
   - Value: (paste your SendGrid API key)
   
   - Key: `SENDGRID_FROM_EMAIL`
   - Value: `noreply@viftraining.com`
   
   - Key: `APP_URL`
   - Value: `https://your-repl-name.repl.co` (your Repl URL)

3. **Verify Sender Email in SendGrid:**
   - Go to SendGrid > Settings > Sender Authentication
   - Verify `noreply@viftraining.com` (or your domain)
   - Follow email verification steps

---

### Step 5: Run the Application

1. **Click the Big Green "Run" Button** at the top!

2. **Replit Will:**
   - Execute `npm start` (from `.replit` config)
   - Start Express server on port 3000
   - Open preview window
   - Generate public URL

3. **You Should See:**
   ```
   🚀 VIF Activity Tracker Server running on port 3000
   📊 Environment: development
   🔗 API available at: http://localhost:3000/api
   ```

4. **Access Your App:**
   - In the preview window (right side)
   - Or click "Open in new tab" button
   - Or use the public URL: `https://your-repl-name.your-username.repl.co`

---

### Step 6: Test the Application

1. **Login as Admin:**
   - Email: `asadeq@viftraining.com`
   - Password: (anything works)

2. **Test Admin Features:**
   - View dashboard with statistics
   - See all employee activities
   - Use search and filters
   - Review an activity
   - Provide feedback

3. **Login as Employee:**
   - Email: `omar@viftraining.com`
   - Password: (anything works)

4. **Test Employee Features:**
   - Select department
   - Add new activity
   - Set units and percentage
   - Submit week
   - View feedback (if admin reviewed)

---

## 🔧 Replit-Specific Features

### Replit Database

Your Repl includes **Replit Database** (key-value store):

- **Automatic** - No setup required
- **Persistent** - Data survives restarts
- **Free** - Included with Replit
- **Simple** - Key-value pairs with JSON

**Data is stored automatically** when you:
- Create users
- Add activities
- Submit weeks
- Review activities

**View Your Data:**
1. Click "Database" icon (🗄️) in left sidebar
2. Browse all keys and values
3. Manually edit if needed (advanced)

### Replit Secrets

Secrets are **environment variables** that:
- Are **encrypted** and secure
- Are **not visible** in code
- Are **not in GitHub** (private)
- Are **automatically loaded** as `process.env`

**Never commit sensitive data to GitHub!**

### Always-On (Optional Upgrade)

Free Repls sleep after inactivity. For production:

1. **Upgrade to Replit Hacker:**
   - Go to your Repl settings
   - Enable "Always On"
   - Cost: ~$7/month
   - Keeps server running 24/7

Or use **UptimeRobot** (free):
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add your Repl URL as monitor
3. Pings every 5 minutes to keep alive

---

## 🎨 Customizing Your Repl

### Change Repl Name

1. Click Repl name at top
2. Type new name
3. Press Enter

### Custom Domain

1. Go to Repl settings
2. Click "Custom Domain"
3. Follow Replit's instructions
4. Update `APP_URL` in Secrets

### Invite Collaborators

1. Click "Invite" button
2. Add email addresses
3. Choose permission level
4. Collaborate in real-time!

---

## 🧪 Testing in Replit

### Test Email System

1. **Open Shell tab**

2. **Send test email:**
   ```bash
   curl -X POST http://localhost:3000/api/email/test \
     -H "Content-Type: application/json" \
     -d '{"to":"your-email@example.com"}'
   ```

3. **Check your inbox** for test email

### Check Database

1. **Open Shell tab**

2. **Quick database check:**
   ```bash
   node -e "const db = require('./server/models/db'); db.getStats().then(console.log)"
   ```

### View Logs

1. **Console tab** shows all server logs
2. Look for:
   - `✉️ Email sent:` - Email notifications
   - `🚀 VIF Activity Tracker Server running` - Server started
   - Any error messages

---

## 🐛 Troubleshooting

### Problem: Dependencies Not Installing

**Solution:**
```bash
# In Shell tab
npm install --force
```

### Problem: Port Already in Use

**Solution:**
- Click "Stop" button
- Wait 5 seconds
- Click "Run" again

### Problem: Database Not Found

**Solution:**
```bash
# Re-initialize database
node server/init-db.js
```

### Problem: Emails Not Sending

**Check:**
1. ✅ SendGrid API key in Secrets
2. ✅ Verified sender email in SendGrid
3. ✅ No typos in secret keys
4. ✅ Check Console for error messages

### Problem: Repl Won't Start

**Solution:**
1. Check `.replit` file exists
2. Verify `package.json` is correct
3. Click "Shell" and run: `npm start`
4. Check Console for errors

### Problem: Can't See Preview

**Solution:**
1. Click "Open in new tab" button
2. Use public URL directly
3. Check firewall/browser settings

---

## 📦 What's Included in Replit Setup

✅ **Automatic:**
- Node.js environment
- Package installation
- Database provisioning
- Port configuration
- Public URL generation
- HTTPS certificate

✅ **Pre-configured:**
- Express server
- API routes
- Database models
- Email templates
- Frontend serving

✅ **Ready to Use:**
- All 17 employees
- Email preferences
- Activity types
- Department mappings

---

## 🔄 Updating Your Repl

### From GitHub

If you update code on GitHub:

1. **In Replit, open Shell**
2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```
3. **Restart server** (Stop → Run)

### Directly in Replit

You can edit files directly in Replit:
1. Changes save automatically
2. Server restarts automatically (if configured)
3. Changes persist in Repl

**To push back to GitHub:**
```bash
git add .
git commit -m "Updated from Replit"
git push origin main
```

---

## 🚀 Production Checklist

Before going live with real users:

- [ ] Database initialized with all 17 employees
- [ ] SendGrid API key configured (if using email)
- [ ] Test all employee accounts work
- [ ] Test admin features work
- [ ] Test email notifications
- [ ] Test on mobile device
- [ ] Set up Always-On (or UptimeRobot)
- [ ] Custom domain configured (optional)
- [ ] Backup plan established
- [ ] Team trained on system

---

## 📊 Monitoring Your Repl

### Built-in Monitoring

Replit provides:
- **Resource usage** - CPU and memory
- **Uptime status** - When Repl is running
- **Request logs** - API activity

### Custom Monitoring

Add to your code:
```javascript
// In server/index.js
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  console.log(`📊 Total requests: ${requestCount}`);
  next();
});
```

---

## 🎓 Learn More

**Replit Resources:**
- [Replit Docs](https://docs.replit.com)
- [Replit Database Guide](https://docs.replit.com/hosting/databases/replit-database)
- [Replit Secrets](https://docs.replit.com/programming-ide/workspace-features/secrets)

**VIF Tracker Docs:**
- `README.md` - Project overview
- `docs/START_HERE.md` - Main navigation
- `docs/DEPLOYMENT_GUIDE.md` - Other deployment options
- `docs/EMAIL_INTEGRATION.md` - Email setup details

---

## ✅ Success!

You now have a **fully functional VIF Activity Tracker** running on Replit! 

**Your public URL:** `https://your-repl-name.your-username.repl.co`

**Share this with your team** and start tracking activities! 🎉

---

## 🆘 Need Help?

**Issues with Replit:**
- [Replit Support](https://replit.com/support)
- [Replit Community](https://replit.com/community)

**Issues with VIF Tracker:**
- Check documentation in `docs/` folder
- Review troubleshooting section above
- Check GitHub Issues (if public repo)

---

**Made with ❤️ for VIF Training**

*Last updated: September 30, 2025*
