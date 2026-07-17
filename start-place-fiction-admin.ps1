$ErrorActionPreference = "Stop"
$siteRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $siteRoot "tools\place-fiction-admin-server.py"
$port = 8765
$healthUrl = "http://127.0.0.1:$port/api/health"
$adminUrl = "http://127.0.0.1:$port/admin/place-fiction-admin.html"
try {
    $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1
    if ($health.ok) { Start-Process -FilePath $adminUrl; exit 0 }
} catch { }
$python = Get-Command python -ErrorAction Stop
$quotedServerScript = '"' + $serverScript + '"'
$process = Start-Process -FilePath $python.Source -ArgumentList @("-X", "utf8", $quotedServerScript, "--port", "$port") -WorkingDirectory $siteRoot -WindowStyle Hidden -PassThru
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 250
    if ($process.HasExited) { throw "Could not start the local editor server." }
    try {
        $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1
        if ($health.ok) { Start-Process -FilePath $adminUrl; exit 0 }
    } catch { }
}
throw "The local editor server did not respond in time."
