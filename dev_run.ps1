# Development helper for BJJSocial backend (PowerShell)
# Usage: Open PowerShell, navigate to this folder and run: .\dev_run.ps1

$venvPath = "./.venv"

if (!(Test-Path $venvPath)) {
    Write-Output "Creating virtual environment in $venvPath"
    python -m venv $venvPath
}

$python = "$venvPath\Scripts\python.exe"
$pip = "$venvPath\Scripts\pip.exe"

if (!(Test-Path $python)) {
    Write-Error "Python not found. Please install Python 3.10+ and ensure 'python' is on your PATH."
    exit 1
}

& $python -m pip install --upgrade pip
& $pip install fastapi "uvicorn[standard]" sqlalchemy "passlib[bcrypt]"

# Set a local SQLite DB and run uvicorn
$env:DATABASE_URL = "sqlite:///./bjj.db"
& $python -m uvicorn BJJSocial.main:app --host 127.0.0.1 --port 8000 --reload
