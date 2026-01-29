#!/bin/bash
# Bash script to push code to GitHub
# Run this AFTER creating the GitHub repository

# Replace YOUR_USERNAME with your actual GitHub username
# Replace pastebin-lite with your repository name if different

read -p "Enter your GitHub username: " github_username
read -p "Enter your repository name (default: pastebin-lite): " repo_name
repo_name=${repo_name:-pastebin-lite}

repo_url="https://github.com/$github_username/$repo_name.git"

echo "Adding remote origin: $repo_url"
git remote add origin "$repo_url"

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "Repository URL: https://github.com/$github_username/$repo_name"
else
    echo ""
    echo "❌ Push failed. Check the error message above."
    echo "Common issues:"
    echo "  - Repository doesn't exist yet (create it at https://github.com/new)"
    echo "  - Authentication failed (use Personal Access Token or GitHub CLI)"
    echo "  - Remote already exists (run: git remote remove origin)"
fi
