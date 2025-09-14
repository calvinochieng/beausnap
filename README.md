# BeauSnap 🎨

**Turn Boring Screenshots into Stunning Visuals**

BeauSnap is a powerful screenshot beautification tool that allows creators, designers, and developers to transform ordinary screenshots into professional, visually appealing images with custom backgrounds, effects, and styling.

## ✨ Features

- 🎨 **Custom Backgrounds**: Choose from 100+ gradients, abstract art, or solid brand colors
- ⚡ **1-Click Effects**: Apply glow, float, 3D skew effects instantly
- 📤 **Pro Export**: PNG, JPEG, HiDPI, and clipboard export options
- 🔧 **Advanced 3D Controls**: Perspective, rotation, and scale adjustments
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🔒 **Privacy-First**: All processing happens locally in your browser

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd beausnap
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Database setup**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

8. **Open your browser**
   ```
   http://localhost:8000
   ```

## 🗄️ Database Configuration

### Local Development (SQLite - Default)
No additional setup required. SQLite database is created automatically.

### Production (Supabase PostgreSQL)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your database credentials from Project Settings → Database
3. Update your `.env` file:
   ```bash
   USE_SUPABASE=True
   SUPABASE_HOST=your-project-ref.supabase.co
   SUPABASE_DB_NAME=postgres
   SUPABASE_USER=postgres
   SUPABASE_PORT=5432
   SUPABASE_PASSWORD=your-supabase-password
   ```
4. Run the migration script:
   ```bash
   python migrate_to_supabase.py
   ```

## 🌐 Deployment

See [DEPLOYMENT_README.md](DEPLOYMENT_README.md) for detailed deployment instructions.

### Static Files
WhiteNoise automatically handles static file serving in production - no additional configuration needed!

### Quick Deploy Options:
- **Railway** (Recommended) - Simple Django deployment
- **Render** - Free tier available
- **Heroku** - Traditional choice
- **DigitalOcean App Platform** - Scalable

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True  # False in production
PRODUCTION=False  # True in production
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
USE_SUPABASE=False  # True for production
SUPABASE_HOST=your-host
SUPABASE_PASSWORD=your-password

# Social Auth (Optional)
GOOGLE_OAUTH2_KEY=your-key
GOOGLE_OAUTH2_SECRET=your-secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password
```

## 📱 Pages & Features

- **Home** (`/`) - Landing page with features and pricing
- **Editor** (`/app/`) - Main screenshot editing tool
- **Authentication** - Sign in/up with Google OAuth
- **Legal Pages**:
  - Terms of Service (`/terms/`)
  - Privacy Policy (`/privacy/`)
  - Refund Policy (`/refund/`)

## 🛠️ Tech Stack

- **Backend**: Django 5.1.1
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Static Files**: WhiteNoise (production)
- **Authentication**: Django Allauth + Google OAuth
- **Payments**: Integration ready for Paddle/Polar
- **Deployment**: Railway, Render, Heroku, etc.

## 📦 Dependencies

See [requirements.txt](requirements.txt) for full list.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Email**: support@beausnap.com
- **Issues**: GitHub Issues
- **Documentation**: See DEPLOYMENT_README.md

---

**Made with ❤️ for creators, designers, and developers worldwide**