# Script to add userEmail to all logAudit calls

$files = @(
    "c:\Users\roland\Documents\Web System\IEM\IEM\backend\routes\auth.js",
    "c:\Users\roland\Documents\Web System\IEM\IEM\backend\routes\inventory.js"
)

foreach ($file in $files) {
    Write-Host "Processing $file..." -ForegroundColor Yellow
    
    $content = Get-Content $file -Raw
    
    # Pattern 1: Add userEmail after userName in logAudit calls
    # This regex finds userName: ... and adds userEmail after it
    $pattern1 = '(userName:\s*req\.user\?\.username[^,\r\n]+),(\s*ip:)'
    $replacement1 = '$1,`r`n        userEmail: req.user?.email || req.email || null,$2'
    $content = $content -replace $pattern1, $replacement1
    
    # Pattern 2: For patterns without req.user
    $pattern2 = '(userName:\s*[''"]?[^,\r\n]+[''"]?\s*),(\s*ip:)'
    $replacement2 = '$1,`r`n        userEmail: req.email || null,$2'
    $content = $content -replace $pattern2, $replacement2
    
    Set-Content $file $content -NoNewline
    Write-Host "✓ Completed $file" -ForegroundColor Green
}

Write-Host "`nAll files processed!" -ForegroundColor Green
