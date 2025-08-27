#!/bin/bash
# TexPro AI - Installation Script
# Installs dependencies based on environment

set -e

ENVIRONMENT=${1:-development}

echo "🚀 Installing TexPro AI Dependencies for: $ENVIRONMENT"

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "✅ Python version: $python_version"

# Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install base requirements
echo "📦 Installing base requirements..."
pip install -r requirements.txt

# Install environment-specific requirements
case $ENVIRONMENT in
    "development" | "dev")
        echo "🔧 Installing development dependencies..."
        pip install -r requirements-dev.txt
        ;;
    "production" | "prod")
        echo "🏭 Installing production dependencies..."
        pip install -r requirements-prod.txt
        ;;
    "testing" | "test")
        echo "🧪 Installing testing dependencies..."
        pip install -r requirements-dev.txt
        ;;
    *)
        echo "⚠️  Unknown environment: $ENVIRONMENT"
        echo "Available options: development, production, testing"
        exit 1
        ;;
esac

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.template to .env and configure"
echo "2. Run: python manage.py migrate"
echo "3. Run: python manage.py createsuperuser"
echo "4. Run: python manage.py runserver"
