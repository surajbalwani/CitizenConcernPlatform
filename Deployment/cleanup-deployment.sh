#!/bin/bash

# Citizen Sphere Cleanup Script - Delete All Heroku Resources

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_APP="citizen-sphere-backend"
FRONTEND_APP="citizen-sphere-frontend"
TEAM_NAME="runtimeterror"

echo -e "${RED}🗑️  Citizen Sphere Resource Cleanup${NC}"
echo "====================================="
echo -e "${YELLOW}⚠️  WARNING: This will DELETE all Heroku resources!${NC}"
echo -e "${YELLOW}   • Backend app: ${BACKEND_APP}${NC}"
echo -e "${YELLOW}   • Frontend app: ${FRONTEND_APP}${NC}"
echo -e "${YELLOW}   • All associated addons and data${NC}"
echo ""

# Confirmation prompt
read -p "Are you sure you want to proceed? Type 'DELETE' to confirm: " -r
echo
if [[ ! $REPLY == "DELETE" ]]; then
    echo -e "${GREEN}✅ Cleanup cancelled${NC}"
    exit 0
fi

echo -e "${RED}🚨 Starting cleanup process...${NC}"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI is not installed${NC}"
    exit 1
fi

# Check Heroku authentication
echo -e "${YELLOW}📝 Checking Heroku authentication...${NC}"
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged into Heroku${NC}"
    exit 1
fi

# Function to delete app with confirmation
delete_app() {
    local app_name=$1
    echo -e "${YELLOW}🔍 Checking if app '${app_name}' exists...${NC}"
    
    if heroku apps:info --app $app_name &> /dev/null; then
        echo -e "${YELLOW}📱 Found app: ${app_name}${NC}"
        
        # List addons before deletion
        echo -e "${YELLOW}📋 Checking addons for ${app_name}...${NC}"
        heroku addons --app $app_name
        
        echo -e "${RED}🗑️  Deleting app: ${app_name}${NC}"
        heroku apps:destroy --app $app_name --confirm $app_name
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully deleted: ${app_name}${NC}"
        else
            echo -e "${RED}❌ Failed to delete: ${app_name}${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  App '${app_name}' does not exist${NC}"
    fi
    echo ""
}

# Delete backend app
delete_app $BACKEND_APP

# Delete frontend app
delete_app $FRONTEND_APP

# Clean up any git remotes
echo -e "${YELLOW}🧹 Cleaning up git remotes...${NC}"
cd ../Backend 2>/dev/null
if git remote get-url heroku &> /dev/null; then
    git remote remove heroku
    echo -e "${GREEN}✅ Removed backend heroku remote${NC}"
fi

cd ../Frontend 2>/dev/null
if git remote get-url heroku &> /dev/null; then
    git remote remove heroku
    echo -e "${GREEN}✅ Removed frontend heroku remote${NC}"
fi

cd ../deployment

echo ""
echo -e "${GREEN}🎉 CLEANUP COMPLETED! 🎉${NC}"
echo "=========================="
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "${GREEN}   • All Heroku apps have been deleted${NC}"
echo -e "${GREEN}   • All associated addons and databases removed${NC}"
echo -e "${GREEN}   • Git remotes cleaned up${NC}"
echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo -e "${YELLOW}   • Run './deploy-all.sh' to redeploy everything${NC}"
echo -e "${YELLOW}   • Or run individual scripts: './deploy-backend.sh' and './deploy-frontend.sh'${NC}"
echo ""
echo -e "${RED}⚠️  Note: All data has been permanently deleted!${NC}"