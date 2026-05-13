const express = require('express');
const cors = require('cors');
require('./config/loadEnv');
const { supabaseAdmin } = require('./supabase');

const { authMiddleware, errorHandler } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const logRoutes = require('./routes/logs');
const gamificationRoutes = require('./routes/gamification');

const app = express();

const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@habittracker.local';
const DEMO_USER_USERNAME = process.env.DEMO_USER_USERNAME || 'Demo User';
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'DemoUser123!';

// CORS Configuration - Allow frontend domain(s)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

async function ensureDemoUser() {
  const { data: usersResponse, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  let demoAuthUser = usersResponse.users.find((user) => user.email === DEMO_USER_EMAIL);

  if (!demoAuthUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      email_confirm: true,
      user_metadata: { username: DEMO_USER_USERNAME },
    });

    if (error) {
      throw error;
    }

    demoAuthUser = data.user;
  }

  process.env.DEMO_USER_ID = demoAuthUser.id;

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .upsert(
      [
        {
          id: demoAuthUser.id,
          email: DEMO_USER_EMAIL,
          username: DEMO_USER_USERNAME,
        },
      ],
      { onConflict: 'id' }
    );

  if (profileError) {
    throw profileError;
  }

  const { error: statsError } = await supabaseAdmin
    .from('user_stats')
    .upsert(
      [
        {
          user_id: demoAuthUser.id,
          total_xp: 0,
          level: 1,
          total_completed: 0,
          total_habits: 0,
        },
      ],
      { onConflict: 'user_id' }
    );

  if (statsError) {
    throw statsError;
  }
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_GUEST_ACCESS !== 'false') {
    await ensureDemoUser();
    console.log(`Guest mode enabled with demo user ${DEMO_USER_EMAIL}`);
  }

  app.listen(PORT, () => {
    console.log(`HabitTracker API running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start HabitTracker API:', error);
  process.exit(1);
});
