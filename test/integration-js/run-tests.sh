#!/bin/bash

# Integration test runner for FIWARE Orion Context Broker
# This script sets up and runs the JavaScript integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ORION_URL=${ORION_BASE_URL:-"http://localhost:1026"}
TEST_TIMEOUT=${ORION_TIMEOUT:-10000}
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}FIWARE Orion Integration Tests${NC}"
echo "=================================="
echo "Target Orion URL: $ORION_URL"
echo "Test timeout: ${TEST_TIMEOUT}ms"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 14 or higher"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo "Please install npm"
    exit 1
fi

echo -e "${YELLOW}Checking Orion connectivity...${NC}"
if curl -f -s "$ORION_URL/version" > /dev/null; then
    echo -e "${GREEN}✓ Orion is reachable${NC}"
else
    echo -e "${RED}✗ Cannot connect to Orion at $ORION_URL${NC}"
    echo "Please ensure Orion is running and accessible"
    exit 1
fi

# Navigate to test directory
cd "$TEST_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing test dependencies...${NC}"
    npm install
fi

# Export environment variables
export ORION_BASE_URL="$ORION_URL"
export ORION_TIMEOUT="$TEST_TIMEOUT"

# Parse command line arguments
JEST_ARGS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            JEST_ARGS+=("--verbose")
            shift
            ;;
        --watch|-w)
            JEST_ARGS+=("--watch")
            shift
            ;;
        --coverage|-c)
            JEST_ARGS+=("--coverage")
            shift
            ;;
        --test-pattern|-t)
            JEST_ARGS+=("--testNamePattern=$2")
            shift 2
            ;;
        --file|-f)
            JEST_ARGS+=("$2")
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose      Run tests with verbose output"
            echo "  -w, --watch        Run tests in watch mode"
            echo "  -c, --coverage     Generate coverage report"
            echo "  -t, --test-pattern <pattern>  Run tests matching pattern"
            echo "  -f, --file <file>  Run specific test file"
            echo "  -h, --help         Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  ORION_BASE_URL     Orion instance URL (default: http://localhost:1026)"
            echo "  ORION_TIMEOUT      Test timeout in ms (default: 10000)"
            exit 0
            ;;
        *)
            JEST_ARGS+=("$1")
            shift
            ;;
    esac
done

echo -e "${YELLOW}Running integration tests...${NC}"
echo ""

# Run the tests
if npm test -- "${JEST_ARGS[@]}"; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi