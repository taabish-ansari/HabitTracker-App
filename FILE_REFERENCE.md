# 📋 Complete File Structure & Reference

## Project Overview

**HabitTracker** is a full-stack gamified habit tracking application with:
- React frontend with calendar grid UI
- Express.js backend API
- PostgreSQL database
- JWT authentication
- XP/level/badge system
- Analytics dashboard
- Streak tracking

---

## 📁 File Structure

### Root Level Files
```
HabitTracker/
├── README.md                 # Project overview & features
├── QUICKSTART.md            # 5-minute setup guide ⭐ START HERE
├── SETUP.md                 # Detailed installation guide
├── FEATURES.md              # Complete feature documentation
├── ARCHITECTURE.md          # Technical architecture & design
├── .gitignore               # Git ignore file
└── [backend/]               # Backend folder
    └── [frontend/]          # Frontend folder
```

---

## 🔙 Backend Files (`/backend`)

### Root Backend Files
```
backend/
├── package.json             # Node.js dependencies & scripts
├── .env                     # Environment variables (DB, JWT_SECRET)
├── .gitignore               # Backend git ignore
├── [db/]                    # Database folder
├── [src/]                   # Source code folder
└── [node_modules/]          # Dependencies (auto-generated)
```

### Database Files (`/backend/db`)
```
db/
├── schema.sql               # Complete PostgreSQL schema
│   ├── Users table
│   ├── Habits table
│   ├── HabitLogs table
│   ├── Streaks table
│   ├── XP logs table
│   ├── Badges table
│   ├── User stats table
│   └── Indexes & constraints
└── setup.js                 # Script to initialize database
```

### Source Code (`/backend/src`)

#### Main Server File
```
src/
├── server.js                # Express server entry point
│   ├── CORS setup
│   ├── Route mounting
│   ├── Error handling
│   └── Port listening
└── db.js                    # PostgreSQL connection pool
```

#### Models (`/backend/src/models`)
```
models/
├── User.js                  # User authentication & profile
│   ├── create()            # Register user
│   ├── findByEmail()       # Login lookup
│   ├── findById()          # Get user profile
│   ├── verifyPassword()    # Password validation
│   └── getStats()          # Get user gamification stats
│
├── Habit.js                 # Habit management
│   ├── create()            # Add habit
│   ├── findByUserId()      # Get user habits
│   ├── findById()          # Get single habit
│   ├── update()            # Edit habit
│   ├── delete()            # Remove habit
│   └── getWithStreaks()    # Habits + streak data
│
├── HabitLog.js              # Habit completion tracking
│   ├── logCompletion()     # Check/uncheck habit
│   ├── getForHabit()       # Get logs for one habit
│   ├── getForUser()        # Get all user logs
│   ├── getCompletedCount() # Count completions
│   ├── getTotalHabits()    # Count total habits
│   └── getCompletionPercentage() # Calculate %
│
└── GameStats.js             # Gamification system
    ├── addXP()             # Award XP
    ├── getUserStats()      # Get stats
    ├── updateStreaks()     # Calculate streaks
    ├── checkStreakBadges() # Award badges
    ├── getBadges()         # Get user badges
    └── getUserLeaderboard()# Get rankings
```

#### Routes (`/backend/src/routes`)
```
routes/
├── auth.js                  # Authentication endpoints
│   ├── POST /register       # Create account
│   ├── POST /login          # Login
│   └── GET /me              # Get profile
│
├── habits.js                # Habit management endpoints
│   ├── POST /                # Create habit
│   ├── GET /                 # List habits
│   ├── GET /:id              # Get single
│   ├── PUT /:id              # Update habit
│   └── DELETE /:id           # Delete habit
│
├── logs.js                  # Habit logging endpoints
│   ├── POST /                # Log completion
│   ├── GET /user/:userId    # Get user logs
│   ├── GET /habit/:habitId  # Get habit logs
│   └── GET /stats/daily/:date # Get daily stats
│
└── gamification.js          # Gamification endpoints
    ├── GET /stats           # Get user stats & badges
    └── GET /leaderboard     # Get rankings
```

#### Middleware (`/backend/src/middleware`)
```
middleware/
└── auth.js                  # Authentication & error handling
    ├── authMiddleware()     # JWT verification
    └── errorHandler()       # Error response formatting
```

---

## 🎨 Frontend Files (`/frontend`)

### Root Frontend Files
```
frontend/
├── package.json             # React dependencies & scripts
├── .gitignore               # Frontend git ignore
├── index.html               # HTML entry point
├── vite.config.js           # Vite build config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── src/                     # Source code
```

### Source Code (`/frontend/src`)

#### Main Files
```
src/
├── main.jsx                 # React entry point
│   └── Renders to div#root in index.html
│
├── App.jsx                  # Main app component
│   ├── Router setup
│   ├── Route definitions
│   ├── Protected routes
│   └── Auth context
│
└── index.css                # Global styles & Tailwind
    ├── Calendar grid styling
    ├── Component styles
    ├── Animations
    └── Responsive design
```

#### Pages (`/frontend/src/pages`)
```
pages/
├── LoginPage.jsx            # Login form
│   ├── Email input
│   ├── Password input
│   ├── Error display
│   ├── Sign up link
│   └── API call
│
├── RegisterPage.jsx         # Registration form
│   ├── Username input
│   ├── Email input
│   ├── Password input
│   ├── Confirm password
│   ├── Validation
│   └── Auto-login on success
│
└── DashboardPage.jsx        # Main app dashboard
    ├── Tab navigation
    ├── Calendar view
    ├── Habits view
    ├── Analytics view
    ├── Gamification view
    ├── Month navigation
    └── Data fetching
```

#### Components (`/frontend/src/components`)
```
components/
├── CalendarGrid.jsx         # Calendar grid UI
│   ├── Monthly view
│   ├── Sticky headers
│   ├── Checkbox cells
│   ├── Habit rows
│   ├── Date columns
│   ├── Streak badges
│   ├── Highlight today
│   └── onClick handlers
│
├── HabitForm.jsx            # Habit creation/editing form
│   ├── Name input
│   ├── Category select
│   ├── Difficulty weight
│   ├── Color picker
│   ├── Submit/Cancel
│   └── Validation
│
├── HabitManager.jsx         # Habit management UI
│   ├── Habit list display
│   ├── Add/Edit/Delete buttons
│   ├── Form toggling
│   ├── Error handling
│   └── useHabits hook
│
├── AnalyticsDashboard.jsx   # Analytics & charts
│   ├── 30-day trend chart
│   ├── Habit completion chart
│   ├── Habit stat cards
│   ├── Key insights
│   ├── Recharts integration
│   └── Data generation
│
└── GamificationPanel.jsx    # Gamification display
    ├── Level & XP display
    ├── Progress bar
    ├── Badges grid
    ├── Stats cards
    ├── Achievement tips
    └── useGameStats hook
```

#### Hooks (`/frontend/src/hooks`)
```
hooks/
└── useHabits.js             # Custom hooks for data
    ├── useHabits()          # Habit CRUD & fetching
    │   ├── fetchHabits()
    │   ├── addHabit()
    │   ├── updateHabit()
    │   └── deleteHabit()
    │
    ├── useHabitLogs()       # Habit log tracking
    │   ├── logHabit()
    │   ├── fetchLogs()
    │   └── logs state
    │
    └── useGameStats()       # Gamification stats
        ├── fetchStats()
        ├── stats state
        └── badges state
```

#### Context (`/frontend/src/context`)
```
context/
└── AuthContext.jsx          # Authentication state
    ├── AuthProvider         # Provider component
    ├── useAuth hook         # Custom hook
    ├── user state           # Current user
    ├── token state          # JWT token
    ├── login()             # Set auth
    └── logout()            # Clear auth
```

#### Services (`/frontend/src/services`)
```
services/
└── api.js                   # API client & endpoints
    ├── Axios instance
    ├── JWT interceptor
    ├── authService          # Register/Login
    ├── habitService         # CRUD habits
    ├── logService           # Log completions
    └── gamificationService  # Get stats
```

---

## 🗂️ Directory Tree

```
HabitTracker/
│
├── README.md
├── QUICKSTART.md
├── SETUP.md
├── FEATURES.md
├── ARCHITECTURE.md
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   │
│   ├── db/
│   │   ├── schema.sql
│   │   └── setup.js
│   │
│   └── src/
│       ├── server.js
│       ├── db.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   ├── Habit.js
│       │   ├── HabitLog.js
│       │   └── GameStats.js
│       │
│       ├── routes/
│       │   ├── auth.js
│       │   ├── habits.js
│       │   ├── logs.js
│       │   └── gamification.js
│       │
│       └── middleware/
│           └── auth.js
│
└── frontend/
    ├── package.json
    ├── .gitignore
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── DashboardPage.jsx
        │
        ├── components/
        │   ├── CalendarGrid.jsx
        │   ├── HabitForm.jsx
        │   ├── HabitManager.jsx
        │   ├── AnalyticsDashboard.jsx
        │   └── GamificationPanel.jsx
        │
        ├── hooks/
        │   └── useHabits.js
        │
        ├── context/
        │   └── AuthContext.jsx
        │
        └── services/
            └── api.js
```

---

## 🔄 Data Flow Summary

### File Dependencies

```
index.html
  └── main.jsx
      └── App.jsx
          ├── AuthContext (context/AuthContext.jsx)
          ├── LoginPage (pages/LoginPage.jsx)
          │   └── authService (services/api.js)
          ├── RegisterPage (pages/RegisterPage.jsx)
          │   └── authService (services/api.js)
          └── DashboardPage (pages/DashboardPage.jsx)
              ├── useHabits (hooks/useHabits.js)
              │   ├── habitService (services/api.js)
              │   ├── logService (services/api.js)
              │   └── gamificationService (services/api.js)
              ├── CalendarGrid (components/CalendarGrid.jsx)
              ├── HabitManager (components/HabitManager.jsx)
              │   ├── useHabits (hooks/useHabits.js)
              │   └── HabitForm (components/HabitForm.jsx)
              ├── AnalyticsDashboard (components/AnalyticsDashboard.jsx)
              └── GamificationPanel (components/GamificationPanel.jsx)
                  └── useGameStats (hooks/useHabits.js)
```

---

## 🔌 API Routes Summary

```
Backend Server (http://localhost:5000)
│
├── /api/auth
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
│
├── /api/habits
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
│
├── /api/logs
│   ├── POST /
│   ├── GET /user/:userId
│   ├── GET /habit/:habitId
│   └── GET /stats/daily/:date
│
└── /api/gamification
    ├── GET /stats
    └── GET /leaderboard
```

---

## 📊 Database Tables Summary

```
PostgreSQL Database (habittracker)
│
├── users
│   └── id, email, password, username, created_at
│
├── habits
│   └── id, user_id, name, category, difficulty_weight, color, ...
│
├── habit_logs
│   └── id, habit_id, date, completed, notes
│
├── streaks
│   └── id, habit_id, current_streak, longest_streak, ...
│
├── xp_logs
│   └── id, user_id, habit_id, xp_earned, date
│
├── badges
│   └── id, user_id, badge_name, description, earned_at
│
└── user_stats
    └── id, user_id, total_xp, level, total_completed, total_habits
```

---

## 📚 Documentation Files

| File | Purpose | For |
|------|---------|-----|
| **README.md** | Project overview | Everyone |
| **QUICKSTART.md** | 5-minute setup | New users |
| **SETUP.md** | Detailed installation | Developers |
| **FEATURES.md** | Feature documentation | Users |
| **ARCHITECTURE.md** | Technical design | Developers |
| **This File** | File reference | Everyone |

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `.env` (backend) | Database URL, JWT secret, port |
| `vite.config.js` | Frontend build & dev server config |
| `tailwind.config.js` | Tailwind CSS theming |
| `postcss.config.js` | PostCSS plugin configuration |

---

## 🚀 Key Files to Modify for Customization

| To customize | Edit file |
|--------------|-----------|
| Habit categories | `frontend/src/components/HabitForm.jsx` |
| Colors | `frontend/src/index.css` or `HabitForm.jsx` |
| Difficulty range | `frontend/src/components/HabitForm.jsx` |
| XP multiplier | `backend/src/models/GameStats.js` |
| Level threshold | `backend/src/models/GameStats.js` |
| Badge criteria | `backend/src/models/GameStats.js` |
| Tailwind theme | `frontend/tailwind.config.js` |

---

## 📖 Reading Order

1. **QUICKSTART.md** - Get it running
2. **README.md** - Understand features
3. **FEATURES.md** - Learn all features
4. **SETUP.md** - Troubleshoot setup
5. **ARCHITECTURE.md** - Understand design
6. **This file** - Reference structure

---

**Version**: 1.0.0
**Last Updated**: May 2026
