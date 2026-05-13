require('../config/loadEnv');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const allowGuestAccess = process.env.NODE_ENV !== 'production' && process.env.ALLOW_GUEST_ACCESS !== 'false';

    if (allowGuestAccess && process.env.DEMO_USER_ID) {
      req.userId = process.env.DEMO_USER_ID;
      req.isGuestUser = true;
      return next();
    }

    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = data.user.id;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
}

module.exports = { authMiddleware, errorHandler };
