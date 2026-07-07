$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Use the official Windows Python launcher, not MSYS2/Git Bash Python.
# MSYS2 Python lacks pre-built wheels for rpds-py/Pillow and fails to compile them.
$Python = "py -3.12"

Write-Host "Creating virtual environment with official Python 3.12..."
Invoke-Expression "$Python -m venv .venv"

$VenvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    throw "Expected .venv\Scripts\python.exe but it was not created. Run: py -3.12 -m venv .venv"
}

Write-Host "Installing dependencies..."
& $VenvPython -m pip install --upgrade pip
& $VenvPython -m pip install -r requirements.txt

Write-Host ""
Write-Host "Done. Activate with:"
Write-Host "  .venv\Scripts\Activate.ps1"
