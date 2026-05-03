# HabitTracker Setup Guide

## Prerequisites

- **Node.js**: v16 or higher
- **PostgreSQL**: v12 or higher
- **npm**: Comes with Node.js

## 🔧 Installation Steps

### 1. Database Setup

First, create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE habittracker;
CREATE USER habituser WITH ENCRYPTED PASSWORD 'habitpassword';
GRANT ALL PRIVILEGES ON DATABASE habittracker TO habituser;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already provided)
# Verify it has correct DATABASE_URL

# Run database setup
npm run db:setup

# Start development server
npm run dev
```

The backend will run on **http://localhost:5000**

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on **http://localhost:3000**

## 🎯 Testing the Application

1. Open **http://localhost:3000** in your browser
2. Click "Sign up" to create a new account
3. Fill in email, username, and password
4. After registration, you'll be logged in automatically
5. Click "Create First Habit" to add your first habit
6. Fill in the habit details:
   - Name: e.g., "Morning Workout"
   - Category: Select from list
   - Difficulty: 0.5-3 (affects XP earned)
   - Color: Choose a color

7. Navigate to the Calendar tab to see your habits
8. Click on cells to mark habits as complete
9. View analytics and gamification features in other tabs

## 📊 Key Features to Test

### Calendar Grid
- Click on date cells to mark habits complete
- Sticky headers for easy navigation
- Current day is highlighted in yellow
- Completed habits show in green

### Habit Management
- Add multiple habits
- Edit habit details
- Delete habits
- See current streaks

### Analytics
- 30-day completion trends
- Per-habit statistics
- Key insights
- Completion percentages

### Gamification
- XP accumulation
- Level progression
- Badge achievements
- Leaderboard

## 🛠️ Troubleshooting

### Database Connection Error

If you get `"connect ECONNREFUSED"`:

1. Verify PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql-x64-14  # or your version
   ```

2. Check DATABASE_URL in `.env` matches your setup

3. Ensure habituser account exists with password 'habitpassword'

### Port Already in Use

Backend port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Frontend port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change ports in:
- Backend: `.env` file
- Frontend: `vite.config.js`

### CORS Errors

If frontend can't reach backend:

1. Check backend is running on http://localhost:5000
2. Verify CORS is enabled in `backend/src/server.js`
3. Check that frontend proxy is configured in `vite.config.js`

## 📁 Project Structure

```
HabitTracker/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Habit.js
│   │   │   ├── HabitLog.js
│   │   │   └── GameStats.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── habits.js
│   │   │   ├── logs.js
│   │   │   └── gamification.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── db.js
│   │   └── server.js
│   ├── db/
│   │   ├── schema.sql
│   │   └── setup.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CalendarGrid.jsx
│   │   │   ├── HabitForm.jsx
│   │   │   ├── HabitManager.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   └── GamificationPanel.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── hooks/
│   │   │   └── useHabits.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Example: Heroku)

```bash
cd backend

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set DATABASE_URL=your_postgresql_url

# Deploy
git push heroku main
```

### Frontend Deployment (Example: Vercel)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📚 API Documentation

### Authentication Endpoints

**Register**
```
POST /api/auth/register
Body: { email, username, password }
Response: { user: { id, email, username } }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, email, username } }
```

**Get Profile**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user, stats, badges }
```

### Habit Endpoints

**Create Habit**
```
POST /api/habits
Body: { name, category, difficulty_weight, color }
Headers: Authorization: Bearer <token>
Response: { id, user_id, name, category, ... }
```

**Get Habits**
```
GET /api/habits
Headers: Authorization: Bearer <token>
Response: [{ id, name, category, current_streak, longest_streak, ... }]
```

**Update Habit**
```
PUT /api/habits/:id
Body: { name, category, difficulty_weight, color }
Headers: Authorization: Bearer <token>
Response: { updated habit }
```

**Delete Habit**
```
DELETE /api/habits/:id
Headers: Authorization: Bearer <token>
Response: { message: "Habit deleted" }
```

### Log Endpoints

**Log Completion**
```
POST /api/logs
Body: { habitId, date: "YYYY-MM-DD", completed: boolean }
Headers: Authorization: Bearer <token>
Response: { id, habit_id, date, completed, ... }
```

**Get Daily Stats**
```
GET /api/logs/stats/daily/:date
Headers: Authorization: Bearer <token>
Response: { date, completed, total, percentage }
```

### Gamification Endpoints

**Get Stats**
```
GET /api/gamification/stats
Headers: Authorization: Bearer <token>
Response: { stats: { total_xp, level, ... }, badges: [...] }
```

**Get Leaderboard**
```
GET /api/gamification/leaderboard?limit=10
Response: [{ username, total_xp, level, total_completed }, ...]
```

## 🔒 Security Considerations

- Change JWT_SECRET before production deployment
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use environment variables for sensitive data
- Consider adding 2FA

## 📝 Development Notes

### Adding New Habits Category

Edit `frontend/src/components/HabitForm.jsx`:
```javascript
const categories = ['Health', 'Study', 'Finance', 'Fitness', 'Personal', 'Work', 'Other', 'YourNewCategory'];
```

### Customizing Colors

Edit `frontend/src/index.css` to change color scheme

### Modifying XP System

Edit `backend/src/models/GameStats.js` `addXP` method:
```javascript
const xpAmount = habit.difficulty_weight * 10; // Change multiplier
```

### Changing Level Threshold

Edit `backend/src/models/GameStats.js`:
```javascript
const newLevel = Math.floor(newTotalXP / 100) + 1; // Change 100 to different value
```

## 🆘 Support

For issues:
1. Check error messages in browser console (F12)
2. Check terminal output for backend errors
3. Verify database connection
4. Review troubleshooting section above

---

**Happy habit tracking! 🎯**
