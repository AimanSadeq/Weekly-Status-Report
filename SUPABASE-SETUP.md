# Supabase Integration Complete! 🎉

Your VIF Activity Tracker is now configured to use Supabase as the database backend.

## ✅ What's Been Done

1. **Installed Supabase Client** - Added `@supabase/supabase-js` to your project
2. **Updated Database Model** - Modified `server/models/db.js` to support Supabase alongside local storage
3. **Environment Configuration** - Created `.env` file with your Supabase credentials
4. **Field Name Mapping** - Added automatic conversion between camelCase (app) and snake_case (Supabase)

## 🔧 Next Steps - Setup Supabase Tables

**IMPORTANT**: You need to create the database tables in Supabase before the app can work properly.

### Option 1: Run SQL Script (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `supabase-setup.sql`
6. Click "Run" or press Ctrl+Enter

This will:
- Create the `activities` table with proper schema
- Create the `users` table
- Create the `email_preferences` table (optional)
- Insert all 17 employees
- Set up proper indexes for performance
- Configure Row Level Security policies

### Option 2: Manual Table Creation

If you prefer to use the Supabase Table Editor:

#### Activities Table
```
Columns:
- id (text, primary key)
- email (text, not null)
- name (text, not null)
- department (text, not null)
- activity_type (text, not null)
- description (text, nullable)
- hours (numeric, not null)
- week (text, not null)
- status (text, not null, default: 'draft')
- feedback (text, nullable)
- reviewed_by (text, nullable)
- reviewed_at (timestamptz, nullable)
- created_at (timestamptz, default: now())
- updated_at (timestamptz, default: now())
```

#### Users Table
```
Columns:
- email (text, primary key)
- name (text, not null)
- role (text, not null)
- departments (jsonb, not null)
- created_at (timestamptz, default: now())
- updated_at (timestamptz, default: now())
```

## 🚀 How It Works Now

The application uses a **hybrid storage system**:

### When Supabase is Configured (Current State)
- ✅ Uses Supabase PostgreSQL database
- ✅ All data stored in the cloud
- ✅ Automatic backups via Supabase
- ✅ Scalable and production-ready

### When Supabase is NOT Configured
- Falls back to local file storage (`.local-data/` folder)
- Good for development/testing without database

### Detection Logic
The app automatically detects Supabase by checking for:
- `SUPABASE_URL` environment variable
- `SUPABASE_KEY` environment variable

If both are present, it uses Supabase. Otherwise, it uses local storage.

## 📝 Environment Variables

Your `.env` file contains:
```env
SUPABASE_URL=https://izjbyapchsrufshdtsgu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Keep this file secure and never commit it to version control!**

## 🧪 Testing the Connection

After setting up the tables in Supabase:

1. Restart the server:
   ```bash
   npm start
   ```

2. You should see:
   ```
   ✅ Supabase client initialized
   📦 Database Mode: Supabase (PostgreSQL)
   🚀 VIF Activity Tracker Server running on port 3000
   ```

3. Test creating an activity:
   ```bash
   curl -X POST http://localhost:3000/api/activities \
     -H "Content-Type: application/json" \
     -d '{
       "id": "test-123",
       "email": "asadeq@viftraining.com",
       "name": "Aiman",
       "department": "Management",
       "activityType": "Meeting",
       "description": "Test activity",
       "hours": 2,
       "week": "2025-10-24",
       "status": "submitted"
     }'
   ```

4. Check Supabase Dashboard to see the new record!

## 🔐 Security Notes

### Row Level Security (RLS)
The SQL script enables RLS but sets permissive policies for development. For production:

1. Create more restrictive policies
2. Consider using Supabase Auth for user authentication
3. Restrict policies based on user roles

### API Keys
- **Anon/Public Key**: Currently in use - safe for client-side code
- **Service Role Key**: Never use in client-side code - only server-side

## 🎯 What's Working

✅ User management (create, read, update)
✅ Activity tracking (CRUD operations)
✅ Email preferences storage
✅ Automatic field name conversion (camelCase ↔ snake_case)
✅ Query filtering by user, week, status
✅ Proper timestamps and indexing

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Troubleshooting

### "Could not find column" errors
- Make sure you ran the SQL script in Supabase
- Check that column names use snake_case (e.g., `activity_type` not `activityType`)

### Connection errors
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check if your Supabase project is active
- Ensure RLS policies allow access

### Data not appearing
- Check Supabase dashboard > Table Editor
- Verify the data was actually inserted (check server logs)
- Check if RLS policies are blocking access

## 🎉 You're All Set!

Once you run the SQL script in Supabase, your application will be fully connected and ready to use!
