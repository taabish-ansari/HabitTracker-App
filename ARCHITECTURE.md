# HabitTracker Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React Frontend (Vite)                         │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Pages                                               │  │ │
│  │  │  • LoginPage         • RegisterPage                  │  │ │
│  │  │  • DashboardPage                                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Components                                          │  │ │
│  │  │  • CalendarGrid      • HabitManager                 │  │ │
│  │  │  • AnalyticsDashboard • GamificationPanel           │  │ │
│  │  │  • HabitForm                                        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Hooks & Services                                    │  │ │
│  │  │  • useHabits         • useHabitLogs                 │  │ │
│  │  │  • useGameStats      • api (axios)                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Context & State                                     │  │ │
│  │  │  • AuthContext       • localStorage (tokens)        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Express.js Backend (Node.js)                    │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Routes (API Endpoints)                              │  │ │
│  │  │  • /api/auth           • /api/habits                │  │ │
│  │  │  • /api/logs           • /api/gamification          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Middleware                                          │  │ │
│  │  │  • CORS                • Authentication (JWT)       │  │ │
│  │  │  • Error Handler       • Body Parser                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Models                                              │  │ │
│  │  │  • User                • Habit                       │  │ │
│  │  │  • HabitLog            • GameStats                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ SQL/pg
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          PostgreSQL Database                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Core Tables                                         │  │ │
│  │  │  • users (authentication)                            │  │ │
│  │  │  • habits (habit definitions)                        │  │ │
│  │  │  • habit_logs (completion tracking)                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Gamification Tables                                 │  │ │
│  │  │  • streaks (streak tracking)                         │  │ │
│  │  │  • xp_logs (XP history)                             │  │ │
│  │  │  • badges (achievements)                            │  │ │
│  │  │  • user_stats (aggregated stats)                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

**users**
```sql
id SERIAL PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL (hashed)
username VARCHAR(255) NOT NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

**habits**
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users
name VARCHAR(255) NOT NULL
category VARCHAR(100) NOT NULL
difficulty_weight FLOAT (0.5-3.0)
color VARCHAR(7) (hex color)
target_frequency VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

**habit_logs**
```sql
id SERIAL PRIMARY KEY
habit_id INTEGER REFERENCES habits
date DATE NOT NULL
completed BOOLEAN DEFAULT FALSE
notes TEXT
created_at TIMESTAMP
UNIQUE(habit_id, date)  -- One log per habit per day
```

### Gamification Tables

**streaks**
```sql
id SERIAL PRIMARY KEY
habit_id INTEGER UNIQUE REFERENCES habits
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
last_completed_date DATE
updated_at TIMESTAMP
```

**xp_logs**
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users
habit_id INTEGER REFERENCES habits
xp_earned FLOAT
date DATE
created_at TIMESTAMP
```

**badges**
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users
badge_name VARCHAR(255)
description TEXT
badge_type VARCHAR(100)
earned_at TIMESTAMP
UNIQUE(user_id, badge_name)
```

**user_stats**
```sql
id SERIAL PRIMARY KEY
user_id INTEGER UNIQUE REFERENCES users
total_xp FLOAT DEFAULT 0
level INTEGER DEFAULT 1
total_completed INTEGER DEFAULT 0
total_habits INTEGER DEFAULT 0
updated_at TIMESTAMP
```

## Data Flow

### User Habit Completion Flow

```
1. User clicks checkbox in calendar grid
   ↓
2. Frontend: CalendarGrid component detects click
   ↓
3. Frontend: Calls logHabit() hook
   ↓
4. API Call: POST /api/logs { habitId, date, completed }
   ↓
5. Backend: Validates request & JWT token
   ↓
6. Backend: Inserts/updates habit_log record
   ↓
7. Backend: If completed:
   - Calculate XP (difficulty_weight × 10)
   - Add to user total_xp
   - Update level (total_xp / 100)
   - Add to xp_logs
   - Update streak (current & longest)
   - Check for badge eligibility
   - Add badges if earned
   ↓
8. Response: Updated log object
   ↓
9. Frontend: Updates local state
   ↓
10. UI: Displays green checkmark, XP popup, etc.
```

### Streak Calculation Logic

```javascript
// When habit completed:
if (todayLog.completed) {
  // Check yesterday
  if (yesterdayLog && yesterdayLog.completed) {
    // Increment streak
    streak = previousStreak + 1
  } else {
    // Start new streak
    streak = 1
  }
  
  // Check for badges
  if (streak === 7) awardBadge("7-day streak")
  if (streak === 30) awardBadge("30-day streak")
  if (streak === 100) awardBadge("Century Master")
}

// If missed today
else {
  streak = 0
}
```

### XP & Level System

```javascript
// When habit completed:
xpEarned = habit.difficulty_weight * 10

userStats.total_xp += xpEarned
userStats.level = Math.floor(userStats.total_xp / 100) + 1

// Level progression example:
// 0-99 XP → Level 1
// 100-199 XP → Level 2
// 200-299 XP → Level 3
// ...
// 1000+ XP → Level 11+
```

## Authentication Flow

```
REGISTRATION:
1. User enters email, username, password
2. Frontend validates locally
3. POST /api/auth/register { email, username, password }
4. Backend validates fields
5. Hash password with bcryptjs
6. Insert user record
7. Create initial user_stats
8. Return user object (no password)
9. Frontend stores token in localStorage
10. Redirect to dashboard

LOGIN:
1. User enters email, password
2. POST /api/auth/login { email, password }
3. Backend finds user by email
4. Compare hashed password
5. If match: generate JWT token
6. Return { token, user }
7. Frontend stores token in localStorage
8. Axios interceptor adds token to all requests
9. Redirect to dashboard

PROTECTED ROUTES:
1. Middleware checks for Authorization header
2. Extract JWT token
3. Verify token signature with JWT_SECRET
4. Extract userId from token payload
5. Add userId to request object
6. Allow request to proceed
7. If invalid/missing: Return 401 error
```

## Component Communication

```
App
├── AuthProvider (context)
│   └── AppContent
│       ├── LoginPage
│       │   └── uses: authService, useAuth
│       ├── RegisterPage
│       │   └── uses: authService, useAuth
│       └── DashboardPage
│           ├── uses: useHabits, useHabitLogs, useGameStats
│           ├── CalendarGrid
│           │   ├── Props: habits, logs, onToggleHabit
│           │   └── emits: handleToggleHabit
│           ├── HabitManager
│           │   ├── uses: useHabits
│           │   └── HabitForm
│           │       └── Props: onSubmit, initialData
│           ├── AnalyticsDashboard
│           │   ├── Props: habits, logs
│           │   └── Charts: LineChart, BarChart
│           └── GamificationPanel
│               └── uses: useGameStats
```

## Performance Optimizations

### Frontend
- React lazy loading (code splitting via Vite)
- Memoization of calendar grid
- Debounced API calls
- Local state management with hooks
- CSS-in-JS for dynamic styling

### Backend
- Database indexes on frequently queried columns
- Connection pooling with pg library
- Efficient query optimization
- No N+1 queries (joins used properly)
- Caching user stats

### Database
- Indexes on:
  - user_id (habits, logs, xp_logs, badges)
  - habit_id (logs, streaks)
  - date (logs, xp_logs)
- Unique constraints prevent duplicates
- Aggregate tables (user_stats) reduce computation

## Security Measures

### Authentication
- JWT tokens for stateless authentication
- Tokens expire after 7 days
- Bcryptjs for password hashing (10 salt rounds)
- No passwords stored in plain text

### Authorization
- Middleware verifies JWT on all protected routes
- Users can only access own data
- No cross-user data access possible

### Data Protection
- CORS enabled for frontend domain only
- SQL injection prevention via parameterized queries
- XSS protection via React's built-in escaping
- CSRF tokens (recommended for future)

### API Security
- Rate limiting (recommended)
- Input validation on all endpoints
- Consistent error messages (no system leaks)
- Environment variables for secrets

## Scalability Considerations

### Current Limitations
- Single server deployment
- No caching layer
- PostgreSQL single instance

### Future Improvements
- Redis cache for user stats
- Horizontal scaling with load balancer
- Database replication
- API versioning
- Microservices (user service, gamification service)
- Message queues for async operations

## Testing Strategy

### Frontend Unit Tests
- Component rendering
- Hook functionality
- API service calls
- Context providers

### Backend Unit Tests
- Model operations
- Route handlers
- Middleware functions
- Database operations

### Integration Tests
- User registration flow
- Habit creation to completion
- XP and level calculation
- Streak updates

### E2E Tests
- Full user journey
- Calendar interaction
- Analytics display
- Gamification rewards

---

## Deployment Architecture

```
┌─────────────────┐
│  Git Repository │
└────────┬────────┘
         │
    ┌────┴─────┐
    │           │
┌───▼──┐   ┌───▼──┐
│Deploy│   │Deploy│
│to    │   │to    │
│Backend   Frontend
│(Heroku)  (Vercel)
└───┬──┐   └───┬──┐
    │  │       │  │
    │  └──┬────┘  │
    │     │       │
    │  ┌──▼──┐ ┌──▼──┐
    │  │ API │ │ Web │
    │  │Server    Client
    │  └──┬──┘ └─────┘
    │     │
    │  ┌──▼─────┐
    │  │PostgreSQL
    │  │Database
    │  │(AWS RDS)
```

---

**Version**: 1.0.0
**Last Updated**: May 2026
