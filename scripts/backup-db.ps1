$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceDb = Join-Path $repoRoot "backend/job_applications.db"
$backupDir = Join-Path $repoRoot "backend/backups"

if (-not (Test-Path -LiteralPath $sourceDb -PathType Leaf)) {
    Write-Error "Database file not found: $sourceDb"
    exit 1
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupPath = Join-Path $backupDir "job_applications-$timestamp.db"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Copy-Item -LiteralPath $sourceDb -Destination $backupPath

$backup = Get-Item -LiteralPath $backupPath
$sizeKb = [Math]::Round($backup.Length / 1KB, 2)

Write-Host "Database backup created:"
Write-Host $backup.FullName
Write-Host "Size: $sizeKb KB"
