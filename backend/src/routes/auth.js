require('../config/loadEnv');
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');
const GameStats = require('../models/GameStats');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  supabaseAdminKey
);

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(toEmail, code) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn('SMTP not configured; skipping sending verification email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: (process.env.SMTP_SECURE === 'true'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.EMAIL_FROM || `no-reply@${new URL(process.env.SUPABASE_URL).hostname}`;

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: 'Your HabitTracker verification code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
}

// Register route - creates auth user via Supabase
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Create auth user (do not auto-confirm email; we will verify via code)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const userId = data.user.id;

    // Update user profile with username
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({ username })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Generate verification code, store hashed, and send email
    try {
      const code = generateCode();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      await supabaseAdmin.from('email_verifications').insert([
        { user_id: userId, code_hash: codeHash, expires_at: expiresAt, used: false },
      ]);

      await sendVerificationEmail(email, code);
    } catch (e) {
      console.warn('verification setup failed', e.message || e);
    }

    res.status(201).json({
      user: {
        id: userId,
        email,
        username,
      },
      message: 'verification_sent',
    });
  } catch (err) {
    next(err);
  }
});

// Verify code endpoint
router.post('/verify', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: ver, error } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!ver) return res.status(400).json({ error: 'No verification code found' });
    if (ver.used) return res.status(400).json({ error: 'Code already used' });
    if (new Date(ver.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });

    const ok = await bcrypt.compare(code, ver.code_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid code' });

    // mark as used
    const { error: updErr } = await supabaseAdmin
      .from('email_verifications')
      .update({ used: true })
      .eq('id', ver.id);
    if (updErr) throw updErr;

    // Optionally create a persistent verified marker (in users table or separate table)
    // We'll insert into a simple table to track verified users
    await supabaseAdmin.from('verified_users').upsert({ user_id: user.id, verified: true });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Login route - generates session token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use Supabase client to authenticate
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check whether user has verified
    const { data: ver, error: verErr } = await supabaseAdmin
      .from('verified_users')
      .select('*')
      .eq('user_id', data.user.id)
      .limit(1)
      .maybeSingle();

    if (verErr) throw verErr;
    if (!ver || !ver.verified) {
      return res.status(403).json({ error: 'verification_required' });
    }

    const user = await User.findById(data.user.id);

    res.json({
      session: data.session,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth').authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const stats = await GameStats.getUserStats(req.userId);
    const badges = await GameStats.getBadges(req.userId);

    res.json({ user, stats, badges });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
