#!/bin/bash
# GLARS Cloudflare deployment script (Workers static assets, see wrangler.jsonc)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GLARS Cloudflare Deployment${NC}"
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
REQUIRED_FILES=("wrangler.jsonc" "public/index.html" "public/css/style.css" "public/js/main.js" "public/js/calculator.js" "public/data/examples.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}ERROR: Required file not found: $file${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Found $file${NC}"
    fi
done

echo ""
echo -e "${BLUE}Deploying to Cloudflare...${NC}"
echo ""

# Deploy using Wrangler; only the public/ directory is uploaded
wrangler deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed. Please check the error message above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Your GLARS project should now be available at:${NC}"
echo -e "${BLUE}https://glars.io${NC}"
echo ""
echo -e "${YELLOW}glars.io is attached as a custom domain via wrangler.jsonc.${NC}"
echo ""
echo -e "${BLUE}Splinters.io 001.5 project via John Carroll${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}           DEPLOYMENT FINISHED          ${NC}"
echo -e "${BLUE}========================================${NC}"