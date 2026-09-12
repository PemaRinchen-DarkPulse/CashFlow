# One command from the CashFlow folder:
#   .\build-mobile.ps1
# Installs packages, logs in to Expo if needed, then builds an Android APK
# that talks to the Vercel API.

param(
  [ValidateSet('preview', 'production', 'development')]
  [string]$Profile = 'preview',

  [ValidateSet('android', 'ios', 'all')]
  [string]$Platform = 'android'
)

$ErrorActionPreference = 'Continue'

$mobileRoot = Join-Path $PSScriptRoot 'mobile'
if (-not (Test-Path (Join-Path $mobileRoot 'package.json'))) {
  throw "mobile\package.json not found. Run this from the CashFlow folder."
}
Set-Location $mobileRoot

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Checked([string]$FailMessage) {
  if ($LASTEXITCODE -ne 0) {
    throw $FailMessage
  }
}

Write-Step "CashFlow mobile build  (profile=$Profile, platform=$Platform)"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is not on PATH. Install it from https://nodejs.org and try again."
}

Write-Step "1/3  Installing npm packages"
npm install
Invoke-Checked "npm install failed"

Write-Step "2/3  Checking Expo login"
npx --yes eas-cli whoami
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not logged in. Sign in when the browser opens, then come back here." -ForegroundColor Yellow
  npx --yes eas-cli login
  Invoke-Checked "eas login failed"
}

Write-Step "3/3  Building in the cloud (this can take 10-20 minutes)"
Write-Host "The APK will talk to https://cash-flow-server-fawn.vercel.app" -ForegroundColor Green
Write-Host "A new Android keystore is created automatically on the first run." -ForegroundColor Green

# CI=1 turns off the EAS spinner that rewrites the same line (the blink).
$env:CI = 'true'
$env:EAS_SKIP_AUTO_FINGERPRINT = '1'
npx --yes eas-cli build --profile $Profile --platform $Platform --non-interactive --wait
Invoke-Checked "eas build failed"

Write-Host ""
Write-Host "Build finished. Use the download URL above, then install the APK on the phone." -ForegroundColor Green
Write-Host "On Android: Settings -> allow Install unknown apps, then open the file." -ForegroundColor Green
