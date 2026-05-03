# 🚀 Deployment & Production Guide

## Deployment Strategies

### Local Development (Current)
- Frontend: http://localhost:3000 (Vite dev server)
- Backend: http://localhost:5000 (Node.js Express)
- Database: Local PostgreSQL

### Production Deployment

---

## Backend Deployment

### Option 1: Heroku (Recommended for quick setup)

#### Prerequisites
- Heroku account (heroku.com)
- Heroku CLI installed

#### Steps

```bash
# 1. Login to Heroku
heroku login

# 2. Create Heroku app
cd backend
heroku create your-app-name

# 3. Create PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev -a your-app-name

# 4. Set environment variables
heroku config:set JWT_SECRET=your_super_secret_key_min_32_chars -a your-app-name
heroku config:set NODE_ENV=production -a your-app-name

# 5. Deploy
git push heroku main

# 6. Run database setup
heroku run npm run db:setup -a your-app-name

# 7. View logs
heroku logs --tail -a your-app-name
```

**Procfile** (create if needed):
```
web: node src/server.js
```

### Option 2: AWS EC2

#### Steps

```bash
# 1. Create EC2 instance (Ubuntu)

# 2. SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# 3. Install Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 5. Create database
sudo -u postgres createdb habittracker
sudo -u postgres createuser habituser
sudo -u postgres psql -c "ALTER USER habituser WITH PASSWORD 'habitpassword';"

# 6. Clone and setup
git clone <repo-url>
cd habittracker/backend
npm install

# 7. Create .env file
nano .env
# Add: DATABASE_URL, JWT_SECRET, etc.

# 8. Setup database
npm run db:setup

# 9. Start with PM2 (process manager)
npm install -g pm2
pm2 start src/server.js --name habittracker-api
pm2 startup
pm2 save
```

### Option 3: Docker

#### Dockerfile (backend/Dockerfile)
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
```

#### Build and run
```bash
docker build -t habittracker-backend .
docker run -p 5000:5000 -e DATABASE_URL=... habittracker-backend
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Configure environment
# Set backend URL in .env.production
VITE_API_URL=https://your-backend-url.com/api

# 4. Redeploy with env vars
vercel --prod
```

#### vercel.json (frontend root)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Connect and deploy
cd frontend
netlify deploy --prod

# 3. Set environment variables in Netlify dashboard
VITE_API_URL=https://your-backend-url.com/api
```

### Option 3: AWS S3 + CloudFront

```bash
# 1. Build frontend
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# 3. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

---

## Database Deployment

### PostgreSQL on RDS (AWS)

#### Steps

```bash
# 1. Create RDS instance through AWS Console
# - Engine: PostgreSQL
# - Version: 13+
# - Instance class: db.t3.micro
# - Storage: 20GB
# - Multi-AZ: No (for dev)

# 2. Configure security group
# - Allow inbound on port 5432 from EC2 instance
# - Allow inbound from backend IP

# 3. Create database
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -c "CREATE DATABASE habittracker;"

# 4. Run schema
psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d habittracker -f db/schema.sql

# 5. Update .env
DATABASE_URL=postgresql://habituser:password@your-rds-endpoint.rds.amazonaws.com:5432/habittracker
```

---

## Environment Variables

### Backend (.env)
```
# Required
DATABASE_URL=postgresql://user:password@host:5432/habittracker
JWT_SECRET=your_very_secret_key_at_least_32_chars

# Optional
PORT=5000
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_NAME=HabitTracker
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```bash
# 1. Install Nginx
sudo apt-get install nginx certbot python3-certbot-nginx

# 2. Create Nginx config
sudo nano /etc/nginx/sites-available/habittracker

# 3. Nginx config template
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/habittracker /etc/nginx/sites-enabled/

# 5. Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# 6. Restart Nginx
sudo systemctl restart nginx
```

---

## CI/CD Pipeline

### GitHub Actions Example

#### .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Deploy backend
      run: git push heroku main
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
    
    - name: Deploy frontend
      run: npm install -g vercel && vercel --prod
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Performance Optimization

### Frontend

```javascript
// 1. Code splitting
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));

// 2. Image optimization
import image from './image.webp';

// 3. Caching strategies
// In Vite config: add caching headers for dist/

// 4. Minification (automatic in build)
npm run build
```

### Backend

```javascript
// 1. Connection pooling
const pool = new Pool({ max: 20 });

// 2. Database indexes (already in schema)

// 3. Compression
app.use(compression());

// 4. Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// 5. Caching headers
app.use(express.static('dist', {
  maxAge: '1d'
}));
```

### Database

```sql
-- Already included in schema.sql
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);
```

---

## Monitoring & Logging

### Application Logging

```javascript
// Backend logging
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in routes
logger.info('Habit created', { habitId: habit.id, userId: req.userId });
```

### Error Tracking

```javascript
// Sentry integration
const Sentry = require("@sentry/node");

Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

```bash
# Health endpoint (already implemented)
curl http://localhost:5000/health

# Response
{ "status": "ok" }

# Use for load balancer health checks
```

---

## Backup & Disaster Recovery

### Database Backups

```bash
# Manual backup
pg_dump -h localhost -U habituser habittracker > backup.sql

# Automated backup (cron job)
0 2 * * * pg_dump -h localhost -U habituser habittracker > /backups/db_$(date +\%Y\%m\%d).sql

# Restore
psql -h localhost -U habituser habittracker < backup.sql

# AWS RDS backup (automatic)
# - Automatic backups: 7 days retention
# - Manual snapshots: create in RDS console
```

### Code Backups

```bash
# GitHub backup (automatic)
git push origin main
git push heroku main

# Regular git commits
git commit -m "deployment backup"
```

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS headers
- [ ] Use environment variables for secrets
- [ ] Enable database authentication
- [ ] Set strong database passwords
- [ ] Enable rate limiting
- [ ] Add firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Implement 2FA for admin users
- [ ] Use prepared statements (already done)
- [ ] Validate all inputs
- [ ] Use HTTPS for API calls

---

## Production Checklist

### Before Going Live

- [ ] Test all features thoroughly
- [ ] Run load tests
- [ ] Check error handling
- [ ] Verify logging works
- [ ] Test backups & recovery
- [ ] Document deployment steps
- [ ] Set up monitoring
- [ ] Configure alerting
- [ ] Train support team
- [ ] Plan rollback strategy

### Deployment Day

- [ ] Deploy backend first
- [ ] Verify API health
- [ ] Deploy frontend
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Have rollback plan ready

### Post-Deployment

- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Monitor error rates
- [ ] Review logs daily
- [ ] Plan future improvements

---

## Scaling Strategy

### When to Scale

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Usage | >70% | Add more servers |
| Memory | >80% | Optimize queries |
| Response Time | >1s | Add caching |
| Database connections | 80%+ | Increase pool |
| Error Rate | >1% | Debug issues |

### Horizontal Scaling

```bash
# Load balancer (Nginx)
upstream backend {
    server api1.example.com;
    server api2.example.com;
    server api3.example.com;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### Caching Layer

```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache user stats
app.get('/api/gamification/stats', (req, res) => {
  const key = `stats:${req.userId}`;
  
  client.get(key, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    
    // Query DB
    GameStats.getUserStats(req.userId)
      .then(stats => {
        client.setex(key, 3600, JSON.stringify(stats));
        res.json(stats);
      });
  });
});
```

---

## Cost Optimization

### Service Costs (Estimates)

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Heroku Backend | Hobby | Free |
| Heroku PostgreSQL | Hobby | Free |
| Vercel Frontend | Hobby | Free |
| Domain Name | .com | $12 |
| **Total** | | ~$12 |

### Free Tier Services

- Vercel (frontend)
- Heroku (backend & DB up to limits)
- GitHub (code hosting)
- Let's Encrypt (SSL)

### Upgrade Path

```
Free Tier → Growth → Enterprise
- Heroku: Hobby → Standard → Private Space
- Vercel: Hobby → Pro → Enterprise
- Database: Hobby → Standard → Dedicated
```

---

## Troubleshooting Production Issues

### Backend Won't Start

```bash
# Check logs
heroku logs --tail -a your-app

# Check env vars
heroku config -a your-app

# Restart
heroku restart -a your-app

# Check database connection
heroku pg:info -a your-app
```

### Database Connection Failures

```bash
# Test connection
psql $DATABASE_URL

# Check pool size
SELECT * FROM pg_stat_activity;

# Restart database
heroku pg:restart DATABASE -a your-app
```

### High Response Times

```bash
# Check slow queries
SET log_min_duration_statement = 1000;  -- Log queries > 1s

# Analyze query plans
EXPLAIN ANALYZE SELECT ...;

# Add indexes if needed
CREATE INDEX idx_name ON table(column);
```

### Out of Memory

```bash
# Check memory usage
free -h

# Restart processes
pm2 restart habittracker-api

# Increase server size
# Heroku: heroku dyno:type Standard-1x
# AWS: Upgrade instance type
```

---

## Post-Launch Improvements

1. **Analytics**: Add Google Analytics
2. **Email**: Add transactional emails
3. **Notifications**: Push notifications
4. **Mobile**: React Native app
5. **Collaboration**: Share habits with friends
6. **API**: Public API for integrations
7. **Automation**: IFTTT/Zapier integration
8. **AI**: Machine learning recommendations

---

## Support & Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update safely
npm update

# Major updates
npm install package@latest
npm test
```

### Database Maintenance

```bash
# Analyze tables
VACUUM ANALYZE;

# Reindex
REINDEX DATABASE habittracker;

# Monitor size
SELECT pg_size_pretty(pg_database_size('habittracker'));
```

---

**Version**: 1.0.0
**Last Updated**: May 2026
