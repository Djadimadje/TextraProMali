# TexPro AI - Windows Installation Script
# Installs dependencies based on environment

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "dev", "production", "prod", "testing", "test")]
    [string]$Environment = "development"
)

Write-Host "🚀 Installing TexPro AI Dependencies for: $Environment" -ForegroundColor Green

# Check Python version
$pythonVersion = python --version 2>&1
Write-Host "✅ Python version: $pythonVersion" -ForegroundColor Yellow

# Upgrade pip
Write-Host "📦 Upgrading pip..." -ForegroundColor Blue
python -m pip install --upgrade pip

# Install base requirements
Write-Host "📦 Installing base requirements..." -ForegroundColor Blue
pip install -r requirements.txt

# Install environment-specific requirements
switch ($Environment) {
    { $_ -in "development", "dev" } {
        Write-Host "🔧 Installing development dependencies..." -ForegroundColor Blue
        pip install -r requirements-dev.txt
    }
    { $_ -in "production", "prod" } {
        Write-Host "🏭 Installing production dependencies..." -ForegroundColor Blue
        pip install -r requirements-prod.txt
    }
    { $_ -in "testing", "test" } {
        Write-Host "🧪 Installing testing dependencies..." -ForegroundColor Blue
        pip install -r requirements-dev.txt
    }
}

Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy .env.template to .env and configure"
Write-Host "2. Run: python manage.py migrate"
Write-Host "3. Run: python manage.py createsuperuser"
Write-Host "4. Run: python manage.py runserver"
