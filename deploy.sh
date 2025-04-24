#!/bin/bash
# GLARS Cloudflare Pages Deployment Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GLARS Cloudflare Pages Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install Wrangler. Please install it manually:${NC}"
        echo "npm install -g wrangler"
        exit 1
    fi
    
    echo -e "${GREEN}Wrangler installed successfully!${NC}"
else
    echo -e "${GREEN}✓ Wrangler CLI found${NC}"
fi

echo ""
echo -e "${BLUE}Preparing for deployment...${NC}"

# Ensure we're in the right directory
cd "$(dirname "$0")"
echo -e "${GREEN}✓ Working in: $(pwd)${NC}"

# Check if user is logged in to Cloudflare
echo -e "${BLUE}Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}You need to log in to Cloudflare first.${NC}"
    wrangler login
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to log in to Cloudflare. Exiting.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Already logged in to Cloudflare${NC}"
fi

echo ""
echo -e "${BLUE}Validating project files...${NC}"

# Check for required files
REQUIRED_FILES=("index.html" "css/style.css" "js/main.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}ERROR: Required file not found: $file${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Found $file${NC}"
    fi
done

# Create Pages project if it doesn't exist
echo ""
echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"
echo -e "${YELLOW}NOTE: If this is your first deployment, you'll be prompted to create a new project.${NC}"
echo ""

# Deploy using Wrangler
wrangler pages deploy . --project-name=glars --branch=main

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed. Please check the error message above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Your GLARS project should now be available at:${NC}"
echo -e "${BLUE}https://glars.pages.dev${NC}"
echo ""
echo -e "${YELLOW}To use a custom domain, you can configure it in the Cloudflare Dashboard.${NC}"
echo ""
echo -e "${BLUE}Splinters.io 001.5 project via John Carroll${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}           DEPLOYMENT FINISHED          ${NC}"
echo -e "${BLUE}========================================${NC}"