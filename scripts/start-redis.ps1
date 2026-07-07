$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$RedisDir = Join-Path $ProjectRoot ".redis\Redis-8.2.4-Windows-x64-msys2"
$RedisExe = Join-Path $RedisDir "redis-server.exe"
$ZipUrl = "https://github.com/redis-windows/redis-windows/releases/download/8.2.4/Redis-8.2.4-Windows-x64-msys2.zip"

if (-not (Test-Path $RedisExe)) {
    Write-Host "Downloading portable Redis..."
    New-Item -ItemType Directory -Force -Path (Split-Path $RedisDir) | Out-Null
    $zipPath = Join-Path (Split-Path $RedisDir) "redis.zip"
    Invoke-WebRequest -Uri $ZipUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath (Split-Path $RedisDir) -Force
    Remove-Item $zipPath
}

Set-Location $RedisDir
Write-Host "Starting Redis on 127.0.0.1:6379..."
& $RedisExe --port 6379 --bind 127.0.0.1 --save "" --appendonly no
