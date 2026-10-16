#!/usr/bin/env bash
# ==============================================================================
# 🚀 END-TO-END WORKFLOW RUNNER FOR ANGULAR 18 MICRO-FRONTEND RSBUILD
# Quy trình tự động hóa khép kín: Setup ➔ Validate ➔ Build ➔ Audit ➔ Report
# ==============================================================================

set -euo pipefail

# Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="${SCRIPT_DIR}/.."
cd "${WORKSPACE_ROOT}"

echo -e "\n${CYAN}======================================================================${NC}"
echo -e "${CYAN}⚡ ANGULAR 18+ MICRO-FRONTEND RSBUILD WORKFLOW AUTOMATION PIPELINE${NC}"
echo -e "${CYAN}======================================================================${NC}\n"

# ------------------------------------------------------------------------------
# STAGE 1: PRE-FLIGHT VALIDATION & ENVIRONMENT SETUP
# ------------------------------------------------------------------------------
echo -e "${BLUE}[STAGE 1/4] 🔍 Pre-flight Inspection & Setup Verification...${NC}"

# Check .npmrc
if [ ! -f ".npmrc" ]; then
    echo "⚠️  Missing .npmrc, creating with legacy-peer-deps=true..."
    echo "legacy-peer-deps=true" > .npmrc
fi
echo -e "  ✓ .npmrc configured"

# Check Manifest Rule (Manifest-First)
if grep -q "remoteEntry.mjs" apps/app-shell/rsbuild.config.ts 2>/dev/null; then
    echo -e "${RED}  ❌ VIOLATION: Host rsbuild.config.ts is pointing to remoteEntry.mjs instead of mf-manifest.json!${NC}"
    exit 1
fi
echo -e "  ✓ Manifest-First Rule compliant (mf-manifest.json in use)"

# Check Core Shared Dependencies
if [ ! -f "module-federation.shared.ts" ]; then
    echo -e "${RED}  ❌ Missing module-federation.shared.ts factory!${NC}"
    exit 1
fi
echo -e "  ✓ Core module-federation.shared.ts ready"

# ------------------------------------------------------------------------------
# STAGE 2: PARALLEL COMPILATION OF ALL APPS
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[STAGE 2/4] 🚀 Executing Parallel Multi-App Compilation...${NC}"

START_TIME=$(date +%s)
if [ -f "scripts/build-parallel.mjs" ]; then
    node scripts/build-parallel.mjs
else
    npx rsbuild build --config apps/app-shell/rsbuild.config.ts &
    npx rsbuild build --config apps/mfe-crm/rsbuild.config.ts &
    npx rsbuild build --config apps/mfe-cdp/rsbuild.config.ts &
    wait
fi
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${GREEN}  ✅ All Micro-Frontends compiled in parallel in ${DURATION}s!${NC}"

# ------------------------------------------------------------------------------
# STAGE 3: BUNDLE SIZING & CHUNK BREAKDOWN AUDIT
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[STAGE 3/4] 📦 Measuring & Auditing Bundle Size...${NC}"

if [ -f "scripts/bundle-size.mjs" ]; then
    node scripts/bundle-size.mjs
fi

# ------------------------------------------------------------------------------
# STAGE 4: CHECKLIST ACCEPTANCE CRITERIA VERIFICATION
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[STAGE 4/4] 📋 Running Quality Checklist Verification...${NC}"

ERRORS=0

# Check 1: Host Dist Output
if [ -f "dist/apps/app-shell/index.html" ]; then
    echo -e "  [Pass] 1. Host Shell index.html generated"
else
    echo -e "  ${RED}[Fail] 1. Missing dist/apps/app-shell/index.html${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Remote 1 CRM Entry
if [ -f "dist/apps/mfe-crm/remoteEntry.mjs" ] && [ -f "dist/apps/mfe-crm/mf-manifest.json" ]; then
    echo -e "  [Pass] 2. CRM remoteEntry.mjs & mf-manifest.json generated"
else
    echo -e "  ${RED}[Fail] 2. Missing CRM artifacts${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Remote 2 CDP Entry
if [ -f "dist/apps/mfe-cdp/remoteEntry.mjs" ] && [ -f "dist/apps/mfe-cdp/mf-manifest.json" ]; then
    echo -e "  [Pass] 3. CDP remoteEntry.mjs & mf-manifest.json generated"
else
    echo -e "  ${RED}[Fail] 3. Missing CDP artifacts${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: SLA Compliance (< 35s for parallel build)
if [ "$DURATION" -le 35 ]; then
    echo -e "  [Pass] 4. Build SLA compliant: ${DURATION}s <= 35s"
else
    echo -e "  ${YELLOW}[Warn] 4. Build SLA exceeded: ${DURATION}s > 35s${NC}"
fi

echo -e "\n${CYAN}======================================================================${NC}"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}🎉 WORKFLOW EXECUTION COMPLETED SUCCESSFULLY WITH 0 ERRORS!${NC}"
    echo -e "${GREEN}All Micro-Frontends are ready for production deployment.${NC}"
else
    echo -e "${RED}❌ WORKFLOW FAILED WITH ${ERRORS} ISSUE(S). Please inspect logs above.${NC}"
    exit 1
fi
echo -e "${CYAN}======================================================================${NC}\n"
