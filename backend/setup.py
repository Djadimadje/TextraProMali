#!/usr/bin/env python
"""
TexPro AI - Setup and Initialization Script
Automates the setup process for development environment
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print("❌ Python 3.9+ is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")

def check_virtual_environment():
    """Check if running in virtual environment"""
    if not (hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)):
        print("⚠️  Warning: Not running in a virtual environment")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Please create and activate a virtual environment first:")
            print("  python -m venv venv")
            print("  venv\\Scripts\\activate  (Windows)")
            print("  source venv/bin/activate  (Linux/Mac)")
            sys.exit(1)
    else:
        print("✅ Virtual environment detected")

def setup_environment_file():
    """Setup .env file from template"""
    env_template = Path('.env.template')
    env_file = Path('.env')
    
    if env_template.exists() and not env_file.exists():
        shutil.copy(env_template, env_file)
        print("✅ .env file created from template")
        print("🔧 Please edit .env file with your configuration")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("⚠️  .env.template not found")

def create_directories():
    """Create necessary directories"""
    directories = [
        'logs',
        'media',
        'media/quality_photos',
        'media/exports',
        'media/avatars',
        'staticfiles',
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Required directories created")

def main():
    """Main setup function"""
    print("🚀 TexPro AI - Setup and Initialization")
    print("=" * 50)
    
    # Check requirements
    check_python_version()
    check_virtual_environment()
    
    # Install dependencies
    if run_command("pip install --upgrade pip", "Upgrading pip"):
        if run_command("pip install -r requirements.txt", "Installing base requirements"):
            run_command("pip install -r requirements-dev.txt", "Installing development requirements")
    
    # Setup environment
    setup_environment_file()
    create_directories()
    
    # Django setup
    if run_command("python manage.py check", "Checking Django configuration"):
        if run_command("python manage.py makemigrations", "Creating migrations"):
            if run_command("python manage.py migrate", "Running migrations"):
                print("✅ Database setup completed")
    
    # Create superuser (optional)
    print("\n🔧 Optional: Create superuser account")
    response = input("Create superuser now? (y/N): ")
    if response.lower() == 'y':
        run_command("python manage.py createsuperuser", "Creating superuser")
    
    # Success message
    print("\n" + "=" * 50)
    print("🎉 TexPro AI setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your configuration")
    print("2. Run: python manage.py runserver")
    print("3. Visit: http://localhost:8000/api/docs/ for API documentation")
    print("4. Visit: http://localhost:8000/admin/ for admin interface")
    print("5. Visit: http://localhost:8000/health/ for health check")
    
    print("\n📚 Available URLs:")
    print("- API Documentation: http://localhost:8000/api/docs/")
    print("- API Schema: http://localhost:8000/api/schema/")
    print("- ReDoc: http://localhost:8000/api/redoc/")
    print("- Admin: http://localhost:8000/admin/")
    print("- Health Check: http://localhost:8000/health/")

if __name__ == "__main__":
    main()
