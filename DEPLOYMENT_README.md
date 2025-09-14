# BeauSnap Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Set `DJANGO_DEBUG=False` in production
- [ ] Configure `DJANGO_ALLOWED_HOSTS` with your domain(s)
- [ ] Set a strong `DJANGO_SECRET_KEY` (generate with `openssl rand -base64 32`)

### 2. Security Configuration
- [ ] Ensure HTTPS is enabled (SSL certificate)
- [ ] Set up proper firewall rules
- [ ] Configure database backups
- [ ] Set up monitoring and logging

### 3. Database Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Static Files
```bash
python manage.py collectstatic --noinput
```

**Note**: WhiteNoise is configured to automatically serve static files in production. No additional web server configuration needed for most deployment platforms.

### 5. Create Superuser (if needed)
```bash
python manage.py createsuperuser
```

## 🌐 Production Environment Variables

### Required for Production:
```bash
# Django
DJANGO_SECRET_KEY=your-production-secret-key
DJANGO_DEBUG=False
PRODUCTION=True  # Explicit production flag
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration
USE_SUPABASE=False  # Set to True for production with Supabase

# Supabase PostgreSQL (for production)
SUPABASE_HOST=your-project-ref.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_USER=postgres
SUPABASE_PORT=5432
SUPABASE_PASSWORD=your-supabase-password

# Local PostgreSQL (alternative to SQLite for development)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Email
EMAIL_HOST=smtp.your-provider.com
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password
```

### Optional but Recommended:
```bash
# Security headers
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000

# External services
GOOGLE_OAUTH2_KEY=your-google-key
GOOGLE_OAUTH2_SECRET=your-google-secret
PAYMENT_API_KEY=your-payment-key
```

## 🗄️ Supabase Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database setup to complete

### 2. Get Database Credentials
1. Go to Project Settings → Database
2. Copy the following values:
   - **Host**: `your-project-ref.supabase.co`
   - **Database name**: `postgres`
   - **Username**: `postgres`
   - **Password**: Your database password
   - **Port**: `5432`

### 3. Configure Environment Variables
```bash
USE_SUPABASE=True
SUPABASE_HOST=your-project-ref.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_USER=postgres
SUPABASE_PORT=5432
SUPABASE_PASSWORD=your-supabase-password
```

### 4. Database Migration
```bash
# Install psycopg2 if not already installed
pip install psycopg2-binary

# Run migrations
python manage.py migrate
```

### 5. Supabase Security
- [ ] Enable Row Level Security (RLS) for tables
- [ ] Set up authentication policies
- [ ] Configure API keys with proper permissions
- [ ] Enable database backups

## 🛠️ Deployment Platforms

### Recommended Options:
1. **Railway** - Simple Django deployment
2. **Render** - Free tier available
3. **Heroku** - Traditional choice
4. **DigitalOcean App Platform** - Scalable
5. **AWS/GCP/Azure** - For enterprise scale

### Railway Deployment (Recommended):
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically
4. Database is auto-configured

## 🔒 Security Best Practices

- [ ] Use HTTPS everywhere
- [ ] Keep Django and dependencies updated
- [ ] Use strong passwords
- [ ] Enable 2FA where possible
- [ ] Regular security audits
- [ ] Monitor for vulnerabilities

## 📊 Post-Deployment

1. Test all functionality
2. Verify email sending
3. Test payment processing
4. Check static files loading
5. Verify social authentication
6. Test responsive design
7. Check SEO and meta tags

## 🆘 Troubleshooting

### Common Issues:
- **Static files not loading**: Run `collectstatic` and check WhiteNoise configuration
- **Database connection errors**: Check DATABASE_URL or Supabase credentials
- **500 errors**: Check logs, ensure DEBUG=False
- **CSRF errors**: Verify HTTPS setup
- **WhiteNoise issues**: Ensure `whitenoise` is in INSTALLED_APPS and middleware

### Useful Commands:
```bash
# Check Django settings
python manage.py check --deploy

# Test email configuration
python manage.py shell -c "from django.core.mail import send_mail; send_mail('Test', 'Test', 'from@example.com', ['to@example.com'])"

# Clear cache (if using caching)
python manage.py clear_cache
```

## 📞 Support

For deployment issues, check:
1. Django deployment documentation
2. Your hosting platform's docs
3. Django community forums
4. Your payment processor's integration guide

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!