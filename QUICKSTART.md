# 🎯 HabitTracker - Quick Start (5 Minutes)

## 🚀 Start Here!

This is the fastest way to get HabitTracker running on your machine.

## Prerequisites Checklist
- [ ] Node.js installed (download from nodejs.org)
- [ ] PostgreSQL installed and running
- [ ] Git (optional, for cloning)

---

## ⚡ 5-Minute Setup

### Step 1: Setup Database (1 minute)

Open **PostgreSQL Command Line** and run:

```sql
CREATE DATABASE habittracker;
CREATE USER habituser WITH ENCRYPTED PASSWORD 'habitpassword';
GRANT ALL PRIVILEGES ON DATABASE habittracker TO habituser;
\q
```

### Step 2: Backend Setup (2 minutes)

Open **Terminal/PowerShell** and navigate to the project:

```bash
cd HabitTracker/backend
npm install
npm run db:setup
npm run dev
```

**Expected Output**:
```
HabitTracker API running on port 5000
Database schema created successfully!
```

### Step 3: Frontend Setup (1 minute)

Open **New Terminal** and run:

```bash
cd HabitTracker/frontend
npm install
npm run dev
```

**Expected Output**:
```
  VITE v4.3.9  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Step 4: Access Application (1 minute)

1. Open browser to **http://localhost:3000**
2. Click **"Sign up"**
3. Create account:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
4. Click **"Create First Habit"**
5. Add a habit:
   - Name: `Morning Workout`
   - Category: `Health`
   - Difficulty: `2.0`
   - Color: `Green`
6. **Done!** 🎉 Click on calendar cells to track

---

## 🎯 Test All Features (5 minutes)

### Calendar Tab
- ✅ Add habit
- ✅ Click calendar cells to mark complete
- ✅ See cells turn green
- ✅ Navigate months with Previous/Next

### Habits Tab
- ✅ See habit cards
- ✅ See streak count
- ✅ Add another habit
- ✅ Edit habit
- ✅ Delete habit

### Analytics Tab
- ✅ See 30-day trend chart
- ✅ See habit completion chart
- ✅ View key insights

### Gamification Tab
- ✅ See your level and XP
- ✅ See progress bar
- ✅ See badges (earn by streaking)

---

## 📝 First Habit Ideas

Try these to see how the app works:

```
Habit 1: Wake Up at 05:00
  Category: Health
  Difficulty: 1.0
  Color: Green

Habit 2: 30 Min Reading
  Category: Study
  Difficulty: 1.5
  Color: Blue

Habit 3: Exercise
  Category: Fitness
  Difficulty: 2.0
  Color: Orange

Habit 4: No Phone After 9pm
  Category: Personal
  Difficulty: 1.0
  Color: Purple
```

---

## ⚠️ Common Issues & Fixes

### "Cannot connect to database"

**Fix**: Ensure PostgreSQL is running
```bash
# Windows
services.msc  # Find PostgreSQL, ensure it's running

# Mac
brew services list  # Find postgres, ensure it's running

# Linux
sudo systemctl status postgresql
```

### "Port 5000 already in use"

**Fix**: Kill the process using port 5000
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### "Port 3000 already in use"

**Fix**: Kill the process using port 3000
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "npm install fails"

**Fix**: Clear npm cache and retry
```bash
npm cache clean --force
npm install
```

### "CORS error in browser"

**Fix**: Ensure both servers are running
```bash
# Terminal 1
cd backend && npm run dev  # Port 5000

# Terminal 2
cd frontend && npm run dev  # Port 3000
```

---

## 🎮 Gamification Quick Guide

### XP System
- Completing a habit earns XP
- XP = difficulty × 10
- Example: 2.0 difficulty = 20 XP

### Levels
- Every 100 XP = 1 level
- Level 1: 0-99 XP
- Level 2: 100-199 XP
- etc.

### Badges
Complete to earn:
- **7-Day Streak**: Complete any habit 7 days straight
- **30-Day Streak**: Complete any habit 30 days straight
- **Century Master**: 100-day streak!

### Streaks
- Shows 🔥 count next to habit
- Reset if you miss a day
- Try to keep it growing!

---

## 📚 Next Steps

1. **Read [SETUP.md](./SETUP.md)** - Full installation guide
2. **Read [FEATURES.md](./FEATURES.md)** - Complete feature documentation
3. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
4. **Check [README.md](./README.md)** - Project overview

---

## 🧪 Testing Checklist

After setup, verify:

- [ ] Can register new account
- [ ] Can login with account
- [ ] Can create habit
- [ ] Can see habit in calendar
- [ ] Can click calendar cell and mark complete
- [ ] Cell turns green when checked
- [ ] Can see analytics charts
- [ ] Can see XP and level in gamification
- [ ] Can edit habit
- [ ] Can delete habit
- [ ] Can navigate months
- [ ] No console errors (press F12)

---

## 🎯 Sample Interaction

```
1. Sign up as: john@example.com / johnuser / password123
   ↓
2. Create habit: "Gym" (Health, 2.0 difficulty, Green)
   ↓
3. Go to Calendar tab
   ↓
4. Click today's cell under "Gym" row
   ↓
5. Cell turns GREEN ✅
   ↓
6. Go to Gamification tab
   ↓
7. See +20 XP earned!
   ↓
8. Keep checking cells to earn more XP and level up! 🚀
```

---

## 🆘 Need Help?

1. **Check browser console** (F12 → Console tab)
2. **Check terminal output** for backend errors
3. **Verify .env file** has correct DATABASE_URL
4. **Restart both servers**
5. **Clear browser cache** (Ctrl+Shift+Delete)
6. **Check database** connection with pgAdmin

---

## 📊 Architecture Overview

```
Frontend (http://localhost:3000)
    ↓
    ← HTTP/API →
    ↓
Backend (http://localhost:5000)
    ↓
    ← SQL →
    ↓
PostgreSQL Database
```

---

## 🎓 Learning Path

**Beginner**: Use the app for 1 week
→ **Intermediate**: Read FEATURES.md
→ **Advanced**: Read ARCHITECTURE.md
→ **Developer**: Check source code

---

## 🚀 You're Ready!

Open **http://localhost:3000** and start tracking your habits!

### Questions?
- Check the docs folder
- Review SETUP.md for detailed instructions
- Check FEATURES.md for feature documentation
- Check ARCHITECTURE.md for technical details

---

**Happy habit tracking! 🎯**

*Version 1.0.0 | Updated May 2026*
