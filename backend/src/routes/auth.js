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
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function saveVerificationCode(userId, code) {
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseAdmin.from('email_verifications').insert([
    { user_id: userId, code_hash: codeHash, expires_at: expiresAt, used: false },
  ]);
}

async function issueVerificationCode(userId, email) {
  const code = generateCode();
  await saveVerificationCode(userId, code);
  await sendVerificationEmail(email, code);
}

async function sendVerificationEmail(toEmail, code) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log('\n' + '='.repeat(60));
    console.log('📧 VERIFICATION CODE (Development Mode)');
    console.log('='.repeat(60));
    console.log(`Email: ${toEmail}`);
    console.log(`Code:  ${code}`);
    console.log('='.repeat(60) + '\n');
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
  console.log('=== REGISTER ENDPOINT CALLED ===', req.body);
  console.log('Starting register process...');
  
  if (!req.body) {
    console.log('No body received');
    return res.status(400).json({ error: 'No request body' });
  }
  
  try {
    console.log('Inside try block');
    const { email, username, password } = req.body;
    console.log('Extracted email, username, password');

    if (!email || !username || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }
    
    console.log('Creating auth user via signUp...');

    // Use public signUp instead of admin.createUser
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      console.log('Auth error details:', error.message, error.code, error.status);
      // Check if it's a duplicate user error
      if (error.message.includes('already exists') || error.code === 'user_already_exists') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: error.message || 'Failed to create user' });
    }

    const userId = data.user.id;
    console.log('Auth user created via signUp:', userId);

    // Upsert user profile (handles case where profile already exists)
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert([{ id: userId, email, username }], { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      console.error('Returning profile error:', `Failed to create profile: ${profileError.message}`);
      return res.status(400).json({ error: `Failed to create profile: ${profileError.message}` });
    }

    // Upsert initial user stats (handles case where stats already exist)
    const { error: statsError } = await supabaseAdmin
      .from('user_stats')
      .upsert([{ user_id: userId, total_xp: 0, level: 1, total_completed: 0, total_habits: 0 }], { onConflict: 'user_id' });

    if (statsError) {
      console.error('Stats upsert error:', statsError);
      console.error('Returning stats error:', `Failed to create stats: ${statsError.message}`);
      return res.status(400).json({ error: `Failed to create stats: ${statsError.message}` });
    }
    
    console.log('Profile and stats created successfully for user:', userId);

    // Generate 4-digit verification code, store hashed, and send email
    try {
      await issueVerificationCode(userId, email);
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
    console.error('=== CATCH BLOCK ERROR ===');
    console.error('Error object:', err);
    console.error('Error message:', err?.message);
    console.error('Error toString:', err?.toString());
    console.error('Error stack:', err?.stack);
    res.status(500).json({ error: err?.message || 'Unknown error in register' });
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

    // Retrieve user profile
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

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.json({ message: 'If that email exists, a reset code has been sent.' });
    }

    try {
      await issueVerificationCode(user.id, email);
    } catch (e) {
      console.warn('failed to send password reset code', e.message || e);
    }

    res.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: ver, error } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!ver) return res.status(400).json({ error: 'No reset code found' });
    if (new Date(ver.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });

    const ok = await bcrypt.compare(code, ver.code_hash);
    if (!ok) return res.status(400).json({ error: 'Invalid code' });

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateErr) throw updateErr;

    const { error: markErr } = await supabaseAdmin
      .from('email_verifications')
      .update({ used: true })
      .eq('id', ver.id);
    if (markErr) throw markErr;

    res.json({ success: true, message: 'Password reset successful' });
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
