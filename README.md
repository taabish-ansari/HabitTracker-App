# HabitTracker - Gamified Daily Habit Tracking System

A full-stack web application for tracking daily habits with gamification, analytics, and streak management.

## 🎯 Features

### Core Features
- **Habit Management**: Create, edit, and delete habits with categories and difficulty levels
- **Calendar Grid UI**: Spreadsheet-style monthly view for tracking habit completion
- **Daily Logging**: Check off completed habits with persistent storage
- **Progress Tracking**: Monitor daily and monthly completion percentages

### Advanced Features
- **Streak System**: Track current and longest streaks per habit
- **Gamification**:
  - XP system based on habit difficulty
  - Level progression (100 XP per level)
  - Badges for achievements (7-day, 30-day, 100-day streaks)
- **Analytics Dashboard**: 
  - 30-day completion trends
  - Habit-specific statistics
  - Key insights and recommendations
- **User Authentication**: JWT-based authentication
- **Leaderboard**: Compare your progress with other users

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)

### Backend Setup

```bash
cd backend
npm install
```

Configure `.env` file:
```
DATABASE_URL=postgresql://habituser:habitpassword@localhost:5432/habittracker
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=5000
NODE_ENV=development
```

Create database:
```bash
npm run db:setup
```

Start server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
HabitTracker/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication middleware
│   │   ├── services/        # Business logic
│   │   └── server.js        # Express server
│   ├── db/
│   │   ├── schema.sql       # Database schema
│   │   └── setup.js         # Database setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Context providers
│   │   ├── services/        # API services
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Habits
- `POST /api/habits` - Create habit
- `GET /api/habits` - Get all habits
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Logs
- `POST /api/logs` - Log habit completion
- `GET /api/logs/user/:userId` - Get user logs
- `GET /api/logs/habit/:habitId` - Get habit logs
- `GET /api/logs/stats/daily/:date` - Get daily stats

### Gamification
- `GET /api/gamification/stats` - Get user stats and badges
- `GET /api/gamification/leaderboard` - Get leaderboard

## 🗄️ Database Schema

- **users**: User accounts and authentication
- **habits**: Habit definitions with metadata
- **habit_logs**: Daily habit completion records
- **streaks**: Streak tracking per habit
- **xp_logs**: XP earning records
- **badges**: User achievements
- **user_stats**: Aggregated user statistics

## 🎮 Gamification System

### XP System
- Each completed habit earns XP = difficulty_weight × 10
- Total XP determines user level

### Levels
- Level = floor(total_XP / 100) + 1
- Progress bar shows XP toward next level

### Badges
- 7-day streak
- 30-day streak
- 100-day streak (Century Master)
- Perfect week (all habits completed 7 consecutive days)

## 🎨 UI Components

- **CalendarGrid**: Main tracking interface with sticky headers
- **HabitManager**: Add/edit/delete habits
- **AnalyticsDashboard**: Charts and insights
- **GamificationPanel**: Level, XP, and badges display
- **LoginPage/RegisterPage**: Authentication pages

## 📊 Analytics

- Monthly completion trends
- Per-habit statistics
- Streak visualization
- Completion percentages

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT token-based authentication
- Protected routes on frontend
- CORS configuration on backend

## 🎯 Usage Example

1. **Sign up** at `/register`
2. **Create habits** in the Habits tab
3. **Track daily** using the calendar grid
4. **View analytics** to monitor progress
5. **Earn badges** by maintaining streaks
6. **Level up** by completing habits consistently

## 🚀 Future Enhancements

- [ ] Dark mode
- [ ] Mobile app
- [ ] Push notifications
- [ ] Habit reminders
- [ ] Social sharing
- [ ] AI habit suggestions
- [ ] Export data (CSV/PDF)
- [ ] Habit templates
- [ ] Groups and challenges

## 📝 License

MIT

---

**Built with:** React, Express.js, PostgreSQL, Tailwind CSS, Recharts
