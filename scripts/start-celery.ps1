$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "Starting Celery worker..."
py -3.12 -m celery -A letterboxlite worker -l info --pool=solo
