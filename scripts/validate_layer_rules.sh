#!/bin/bash

# validate_layer_rules.sh
# Custom linter to enforce MVP architectural layer rules for UniversityScheduler

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

ERRORS=0

echo -e "${YELLOW}Starting Layer Rules Validation...${NC}\n"

# 1. Check if atoms use heavy mutation hooks
echo "Checking frontend atomic design rules..."
ATOM_HOOKS=$(grep -rnw 'frontend/src/components/atoms' -e 'useAuth\|useTasks\|useSchedule\|useProfessors\|useGrades\|useSettings\|useNotifications' 2>/dev/null)
if [ ! -z "$ATOM_HOOKS" ]; then
    echo -e "${RED}❌ ERROR: Found business logic hooks in atoms. Atoms must be purely presentational.${NC}"
    echo "$ATOM_HOOKS"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ Frontend: No business logic hooks in atoms.${NC}"
fi

# 2. Check for "use client" in atoms using React context/heavy hooks, though this is harder to statically analyze reliably, skip for now.

# 3. Check Hexagonal Architecture Boundaries in Backend Domain
echo "Checking backend domain boundaries..."
DOMAIN_VIOLATIONS=$(grep -rn 'backend/app/modules' -e 'from \.*adapter\|import \.*adapter\|from \.*infrastructure\|import \.*infrastructure' | grep '/domain/' 2>/dev/null)
if [ ! -z "$DOMAIN_VIOLATIONS" ]; then
    echo -e "${RED}❌ ERROR: Found adapter/infrastructure imports inside domain layer.${NC}"
    echo "$DOMAIN_VIOLATIONS"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ Backend: Domain layer is pristine.${NC}"
fi

# 4. Check Hexagonal Architecture Boundaries in Backend Ports
echo "Checking backend port boundaries..."
PORT_VIOLATIONS=$(grep -rn 'backend/app/modules' -e 'from \.*adapter\|import \.*adapter\|from \.*infrastructure\|import \.*infrastructure' | grep '/port/' 2>/dev/null)
if [ ! -z "$PORT_VIOLATIONS" ]; then
    echo -e "${RED}❌ ERROR: Found adapter/infrastructure imports inside port layer.${NC}"
    echo "$PORT_VIOLATIONS"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ Backend: Port layer is pristine.${NC}"
fi

# 5. Check if pages call fetch instead of api.ts
echo "Checking frontend pages for direct fetch calls..."
PAGE_FETCHES=$(grep -rnw 'frontend/src/app' -e 'fetch(' 2>/dev/null)
if [ ! -z "$PAGE_FETCHES" ]; then
    echo -e "${RED}❌ ERROR: Found direct fetch() calls in pages. Use @/lib/api.ts instead.${NC}"
    echo "$PAGE_FETCHES"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ Frontend: No direct fetch() calls in pages.${NC}"
fi

echo -e "\n${YELLOW}Validation Complete.${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All layer rules validated successfully! 🎉${NC}"
    exit 0
else
    echo -e "${RED}Found $ERRORS violation(s). Please fix them before committing.${NC}"
    exit 1
fi
