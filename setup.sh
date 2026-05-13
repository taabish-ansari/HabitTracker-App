#!/bin/bash
# Quick setup script for deployment

echo "🚀 HabitTracker Deployment Setup"
echo "=================================="

# Create environment files if they don't exist
if [ ! -f backend/.env.local ]; then
  echo "📝 Creating backend/.env.local from template..."
  cp backend/.env.example backend/.env.local
  echo "⚠️  IMPORTANT: Edit backend/.env.local and fill in your Supabase credentials"
fi

if [ ! -f frontend/.env.local ]; then
  echo "📝 Creating frontend/.env.local from template..."
  cp frontend/.env.example frontend/.env.local
  echo "⚠️  IMPORTANT: Edit frontend/.env.local with your API URL"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env.local with your Supabase credentials"
echo "2. Edit frontend/.env.local with your backend API URL"
echo "3. Run: npm run dev (in frontend)"
echo "4. In another terminal: npm run dev (in backend)"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for full deployment instructions"
