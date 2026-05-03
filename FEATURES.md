# HabitTracker - Complete Feature Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Habit Management](#habit-management)
3. [Calendar Grid](#calendar-grid)
4. [Logging & Tracking](#logging--tracking)
5. [Gamification System](#gamification-system)
6. [Analytics](#analytics)
7. [Streaks](#streaks)

---

## Authentication

### Registration
- Create a new account with email, username, and password
- Password validation: minimum 6 characters
- Passwords must match confirmation
- Email must be unique
- Auto-login after successful registration

### Login
- Email and password authentication
- JWT tokens stored in localStorage
- Automatic session persistence
- Tokens expire after 7 days
- Protected routes require valid token

---

## Habit Management

### Creating Habits
**Location**: Dashboard → Habits tab → "Add New Habit"

**Required Fields**:
- **Name**: Habit name (e.g., "Morning Workout", "Read 30 mins")
- **Category**: Select from predefined categories
  - Health
  - Study
  - Finance
  - Fitness
  - Personal
  - Work
  - Other

**Optional Fields**:
- **Difficulty Weight** (0.5-3.0):
  - 0.5: Easy habits (e.g., drink water)
  - 1.0: Normal habits (default)
  - 2.0: Challenging habits (e.g., workout)
  - 3.0: Very difficult habits (e.g., cold shower)
  - **Impact**: Multiplies XP earned
- **Color**: Visual identifier in calendar (7 colors available)

### Editing Habits
- Click "Edit" button on habit card
- Modify any field
- Changes apply immediately

### Deleting Habits
- Click "Delete" button on habit card
- Confirmation required
- Deletes all associated logs and streaks

### Habit List View
- View all active habits
- See current streak for each habit
- Quick edit/delete access
- Category and difficulty at a glance

---

## Calendar Grid

### Layout
```
                 📅 Days 1-31
            ┌─────────────────────┐
 Habits     │ Day 1, Day 2, Day 3 │
┌────────┤ ├─────────────────────┤
│Workout  │ ☑️  ☐  ☑️  ...      │
│Read     │ ☑️  ☑️  ☑️  ...      │
│Meditate │ ☐  ☐  ☑️  ...      │
└────────┤ └─────────────────────┘
```

### Features

**Sticky Headers**:
- Habit names always visible (left column)
- Dates always visible (top row)
- Horizontal and vertical scrolling

**Visual Indicators**:
- ☑️ Green background = Completed
- ☐ White background = Not completed
- 🟨 Yellow background = Today's date
- 🔥 Streak badge = Current streak count

**Interaction**:
- Click cell to toggle completion status
- Immediately updates display
- Syncs with backend

**Date Navigation**:
- "← Previous": Go to previous month
- "Next →": Go to next month
- "Today": Jump to current month
- Prevents data loss on transitions

---

## Logging & Tracking

### Completion Tracking
- **Default**: Unchecked (not completed)
- **Action**: Click checkbox to complete
- **Effect**: 
  - Cell turns green
  - XP is awarded
  - Streak is updated
  - Analytics updated

### Automatic Logging
- Date is automatically set to selected date
- Prevents duplicate entries (one per habit per day)
- Toggle-able (can uncheck to mark incomplete)

### Progress Display
- **Daily Completion %**: Shows percentage for specific date
- **Monthly Completion %**: Overall completion for month
- **Progress Bar**: Visual representation

---

## Gamification System

### XP System

**How XP is Earned**:
- Completing a habit = difficulty_weight × 10 XP
- Example: 2.0 difficulty = 20 XP per completion
- Only awarded for completed habits
- Can earn multiple times per day (one per habit)

**XP Display**:
- Total XP shown in gamification panel
- Tracked in user profile
- Used for leaderboard ranking

### Level System

**Level Calculation**:
- Level = floor(total_XP / 100) + 1
- Example:
  - 0-99 XP = Level 1
  - 100-199 XP = Level 2
  - 200-299 XP = Level 3

**Progress Indicator**:
- Progress bar shows XP toward next level
- Displays XP needed to level up
- Visual feedback on profile

### Badges

**Badge Types Awarded**:

| Badge | Requirement |
|-------|-------------|
| 7-day Streak | Any habit with 7 consecutive completions |
| 30-day Streak | Any habit with 30 consecutive completions |
| Century Master | Any habit with 100-day streak |
| Perfect Week | All habits completed for 7 consecutive days |

**Badge Display**:
- Show earned date
- Display description
- Cannot be earned twice

**Achievement Tracking**:
- Badges in gamification panel
- User profile shows all badges
- Leaderboard may show badge count

---

## Streaks

### Streak Calculation

**Current Streak**:
- Counts consecutive days of completion
- Resets to 0 if missed a day
- Counts from most recent completion backward

**Longest Streak**:
- Highest consecutive completion count achieved
- Never decreases
- Shows historical peak performance

### Streak Display
- Badge on habit card: 🔥 X
- Calendar grid: Shows next to habit name
- Analytics: Individual habit streak stats

### Streak Examples

**Example 1**: Days 1, 2, 3, 4, X, 5, 6, 7
- Current Streak: 2 (Days 6-7)
- Longest Streak: 4 (Days 1-4)

**Example 2**: Days 1-10 completed, then miss day 11
- Current Streak: 0
- Longest Streak: 10

---

## Analytics

### Available Views

**30-Day Completion Trend**
- Line chart showing daily completion percentage
- X-axis: Last 30 days
- Y-axis: Completion % (0-100%)
- Shows consistency over time

**Habit Completion Stats**
- Bar chart with stacked bars
- Shows completed vs missed days
- Per-habit breakdown
- Last 30 days

**Individual Habit Cards**
- Completion count (X/30)
- Current streak
- Visual progress bar
- Color-coded

### Key Insights

**Automatically Calculated**:
- Average completion rate
- Most completed habit
- Best streak
- Motivational tips

**Use Cases**:
- Identify weak days (e.g., Mondays)
- Find easiest/hardest habits
- Track long-term trends
- Celebrate consistency

---

## Advanced Features

### Categories

**Purpose**: Organize habits by life area
- Visual grouping in UI
- Filtering in analytics (future enhancement)
- Motivation context

**Built-in Categories**:
- Health: fitness, sleep, nutrition
- Study: learning, courses, practice
- Finance: budgeting, tracking, investments
- Fitness: workouts, cardio, strength
- Personal: hobbies, goals, self-care
- Work: productivity, tasks, learning
- Other: miscellaneous

### Color Customization

**Purpose**: Visual habit differentiation
- 7 pre-defined colors
- Assigned at creation
- Modifiable anytime
- Affects calendar grid appearance

**Colors Available**:
- 🟢 Green (#4CAF50)
- 🔵 Blue (#2196F3)
- 🟠 Orange (#FF9800)
- 🟣 Purple (#9C27B0)
- 🔴 Red (#F44336)
- 🔷 Cyan (#00BCD4)
- 🟡 Yellow (#FFEB3B)

### Difficulty Weight

**Purpose**: Adjust XP rewards and importance
- Reflects how challenging the habit is
- Scales XP earnings
- Range: 0.5 - 3.0

**Recommendations**:
- **0.5**: Trivial, almost automatic (e.g., drink water)
- **1.0**: Standard habit (default, e.g., reading)
- **1.5**: Moderately challenging (e.g., exercise)
- **2.0**: Difficult, requires focus (e.g., cold shower)
- **3.0**: Very difficult, major commitment (e.g., no social media)

---

## Data Persistence

### Cloud Sync
- All data saved to PostgreSQL database
- Real-time sync (toggling habits)
- Automatic backup on each update

### Offline Considerations
- Offline mode not currently supported
- Must have internet connection for all operations
- Local authentication tokens persisted

### Data Privacy
- Passwords hashed with bcryptjs
- No plain-text sensitive data
- User data only accessible by owner

---

## Tips & Best Practices

### Starting Out
1. Start with 3-5 habits
2. Mix easy and difficult habits
3. Set realistic difficulty weights
4. Use color coding strategically
5. Check calendar daily

### Maintaining Streaks
1. Mark habits at same time daily
2. Set phone reminders
3. Start with achievable habits
4. Gradually increase difficulty
5. Celebrate small wins

### Maximizing XP
1. Complete high-difficulty habits
2. Maintain consistent streaks
3. Add new habits (if manageable)
4. Track every completion
5. Review analytics weekly

### Using Analytics
1. Review weekly trends
2. Identify weakness patterns
3. Adjust difficulty as needed
4. Celebrate improvements
5. Share progress with others

---

## Troubleshooting

### Habit Won't Toggle
- Ensure you're logged in
- Check browser console for errors
- Verify backend is running
- Try refreshing page

### Streak Not Updating
- Wait a few seconds for sync
- Check network connection
- Verify backend is running
- Try toggling again

### Missing Habits
- Log out and log back in
- Refresh page (Ctrl+R)
- Check if deleted accidentally
- Contact support if persists

### XP Not Updating
- Ensure habit was completed
- Check difficulty weight > 0
- Wait for page refresh
- Check gamification panel

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+R` | Refresh page |
| `Ctrl+L` | Go to login |
| `Tab` | Navigate form fields |
| `Enter` | Submit forms |

---

**Last Updated**: May 2026
**Version**: 1.0.0
