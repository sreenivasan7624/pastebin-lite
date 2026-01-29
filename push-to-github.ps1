# PowerShell script to push code to GitHub
# Run this AFTER creating the GitHub repository

# Replace YOUR_USERNAME with your actual GitHub username
# Replace pastebin-lite with your repository name if different

$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter your repository name (default: pastebin-lite)" 
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "pastebin-lite"
}

$repoUrl = "https://github.com/$githubUsername/$repoName.git"

Write-Host "Adding remote origin: $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$githubUsername/$repoName" -ForegroundColor Green
} else {
    Write-Host "`n❌ Push failed. Check the error message above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Repository doesn't exist yet (create it at https://github.com/new)" -ForegroundColor Yellow
    Write-Host "  - Authentication failed (use Personal Access Token or GitHub CLI)" -ForegroundColor Yellow
    Write-Host "  - Remote already exists (run: git remote remove origin)" -ForegroundColor Yellow
}
