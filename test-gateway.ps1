$ErrorActionPreference = "SilentlyContinue"

Write-Output "Starting API Gateway..."
$gw = Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory "c:\Users\lasit\OneDrive\Documents\IDEs\VS Code\Task-Management-System\api-gateway" -PassThru

Write-Output "Starting Reporting Analytics Service..."
$rpt = Start-Process -FilePath "node" -ArgumentList "src/app.js" -WorkingDirectory "c:\Users\lasit\OneDrive\Documents\IDEs\VS Code\Task-Management-System\reporting-analytics" -PassThru

Write-Output "Waiting for services to spin up..."
Start-Sleep -Seconds 5

Write-Output "Testing /api/reports route..."
$res1 = Invoke-WebRequest -Uri "http://localhost:5000/api/reports" -Method Get
Write-Output "Reports Route Status: $($res1.StatusCode)"

Write-Output "Testing /api/analytics/summary route..."
$res2 = Invoke-WebRequest -Uri "http://localhost:5000/api/analytics/summary?period=week" -Method Get
Write-Output "Analytics Route Status: $($res2.StatusCode)"

Write-Output "Cleaning up processes..."
Stop-Process -Id $gw.Id -Force
Stop-Process -Id $rpt.Id -Force

Write-Output "Done."
