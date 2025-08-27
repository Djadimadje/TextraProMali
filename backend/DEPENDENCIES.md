# TexPro AI - Dependencies Overview

## 📦 Core Dependencies

### Django Framework
- **Django 5.2.5** - Main web framework
- **Django REST Framework 3.16.1** - API development
- **djangorestframework-simplejwt 5.5.1** - JWT authentication
- **django-cors-headers 4.6.0** - CORS handling

### Database
- **SQLite** - Development database (built into Python)
- **psycopg2-binary 2.9.10** - PostgreSQL adapter (production)

### Image Processing
- **Pillow 11.0.0** - Image handling for quality control photos

### Data Processing
- **pandas 2.2.3** - Data analysis and manipulation
- **numpy 2.1.3** - Numerical computations

### File Export
- **openpyxl 3.1.5** - Excel file generation
- **xlsxwriter 3.2.0** - Advanced Excel features

### API Documentation
- **drf-spectacular 0.27.2** - OpenAPI/Swagger documentation

### Task Queue (Optional)
- **celery 5.4.0** - Asynchronous task processing
- **redis 5.1.1** - Message broker for Celery

## 🔧 Development Dependencies

### Testing
- **pytest 8.3.3** - Testing framework
- **pytest-django 4.9.0** - Django integration
- **pytest-cov 5.0.0** - Code coverage
- **factory-boy 3.3.1** - Test data generation

### Code Quality
- **black 24.8.0** - Code formatting
- **flake8 7.1.1** - Linting
- **isort 5.13.2** - Import sorting
- **pre-commit 4.0.1** - Git hooks

### Development Tools
- **django-debug-toolbar 4.4.6** - Debug information
- **ipython 8.28.0** - Enhanced Python shell

## 🏭 Production Dependencies

### Web Server
- **gunicorn 23.0.0** - WSGI HTTP Server
- **uvicorn 0.32.0** - ASGI server

### Static Files
- **whitenoise 6.8.2** - Static file serving
- **django-storages 1.14.4** - Cloud storage support

### Monitoring
- **sentry-sdk 2.17.0** - Error tracking
- **newrelic 10.2.0** - Performance monitoring

### Caching
- **django-redis 5.4.0** - Redis cache backend

## 📋 Installation Commands

### Basic Installation
```bash
# Install base requirements
pip install -r requirements.txt
```

### Development Setup
```bash
# Install development dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Or use the installation script
./install.ps1 development
```

### Production Setup
```bash
# Install production dependencies
pip install -r requirements.txt
pip install -r requirements-prod.txt

# Or use the installation script
./install.ps1 production
```

### Quick Environment Check
```bash
# Check if all packages are installed correctly
python manage.py check

# Verify database connection
python manage.py check --database

# Check for missing dependencies
pip check
```

## 🔄 Dependency Updates

### Check for Updates
```bash
# Check outdated packages
pip list --outdated

# Generate new requirements (if needed)
pip freeze > requirements-current.txt
```

### Security Updates
```bash
# Check for security vulnerabilities
pip-audit

# Update specific packages
pip install --upgrade package-name
```

## 🚨 Important Notes

1. **Python Version**: Requires Python 3.9+
2. **Virtual Environment**: Always use virtual environment
3. **Development vs Production**: Use appropriate requirements file
4. **Security**: Keep dependencies updated regularly
5. **Compatibility**: Test after major updates

## 📊 Dependency Tree

```
TexPro AI Backend
├── Django (Web Framework)
│   ├── DRF (API Framework)
│   ├── JWT (Authentication)
│   └── CORS (Cross-origin)
├── Data Processing
│   ├── Pandas (Data manipulation)
│   ├── NumPy (Numerical computing)
│   └── Pillow (Image processing)
├── Storage & Export
│   ├── OpenPyXL (Excel export)
│   └── SQLite/PostgreSQL (Database)
└── Quality & Testing
    ├── Pytest (Testing)
    ├── Black (Formatting)
    └── Flake8 (Linting)
```
