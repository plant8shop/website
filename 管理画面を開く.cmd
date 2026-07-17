@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-place-fiction-admin.ps1"
if errorlevel 1 (
  echo Could not open the local editor.
  pause
)
endlocal
