#!/usr/bin/env python
"""
Migration script to help transition from SQLite to Supabase PostgreSQL
Run this script after setting up your Supabase database.
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beausnap.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def migrate_to_supabase():
    """
    Helper script to migrate from SQLite to Supabase PostgreSQL
    """
    print("🚀 Starting migration to Supabase PostgreSQL...")

    # Check if we're using Supabase
    from decouple import config
    use_supabase = config('USE_SUPABASE', default=False, cast=bool)

    if not use_supabase:
        print("❌ USE_SUPABASE is not set to True in your environment variables")
        print("Please set USE_SUPABASE=True in your .env file")
        return

    print("✅ Supabase configuration detected")

    # Test database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your Supabase credentials in the .env file")
        return

    # Run migrations
    print("📦 Running database migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
        print("✅ Migrations completed successfully")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return

    # Create superuser if needed
    create_superuser = input("Do you want to create a superuser? (y/n): ").lower().strip()
    if create_superuser == 'y':
        print("👤 Creating superuser...")
        try:
            execute_from_command_line(['manage.py', 'createsuperuser'])
            print("✅ Superuser created successfully")
        except Exception as e:
            print(f"❌ Superuser creation failed: {e}")

    print("🎉 Migration to Supabase completed successfully!")
    print("\nNext steps:")
    print("1. Test your application locally with USE_SUPABASE=True")
    print("2. Deploy to your production platform")
    print("3. Set USE_SUPABASE=True in production environment variables")

if __name__ == '__main__':
    migrate_to_supabase()