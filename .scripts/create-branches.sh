#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Define the apps and packages
apps=("api" "app" "docs" "engine" "mobile" "website")
packages=("documents" "email" "events" "import" "inbox" "jobs" "kv" "location" "notification" "supabase" "tsconfig" "ui" "utils")

# Define the branch types
branch_types=("feature" "chore" "bug")

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Create branches for apps and packages
create_branches() {
    local items=("$@")
    for item in "${items[@]}"; do
        for branch_type in "${branch_types[@]}"; do
            branch_name="${branch_type}/${item}"
            if ! git show-ref --quiet refs/heads/"$branch_name"; then
                git checkout -b "$branch_name"
                log "🌱 Created new branch: $branch_name"
                git checkout main
            else
                log "ℹ️ Branch already exists: $branch_name"
            fi
        done
    done
}

# Ensure we're on the main branch
git checkout main

# Create branches for apps
log "📁 Creating branches for apps..."
create_branches "${apps[@]}"

# Create branches for packages
log "📦 Creating branches for packages..."
create_branches "${packages[@]}"

log "🎉 Branch creation completed."
