#!/bin/bash
#
# Coverage reporting script
# Generates comprehensive test coverage reports
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Coverage Report Generator"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  unit         Generate unit test coverage report"
    echo "  e2e          Generate E2E test coverage report"
    echo "  combined     Generate combined coverage report"
    echo "  html         Generate HTML coverage report and open in browser"
    echo "  ci           Generate CI-friendly coverage report"
    echo "  clean        Clean coverage directories"
    echo "  threshold    Check coverage thresholds"
    echo "  badge        Generate coverage badge data"
    echo "  help         Show this help message"
    echo ""
}

# Clean coverage directories
clean_coverage() {
    print_status "Cleaning coverage directories..."
    rm -rf coverage coverage-e2e coverage-combined
    print_success "Coverage directories cleaned!"
}

# Generate unit test coverage
unit_coverage() {
    print_status "Running unit tests with coverage..."
    npm run test:cov:all
    print_success "Unit test coverage generated in coverage/ directory"
}

# Generate E2E test coverage
e2e_coverage() {
    print_status "Running E2E tests with coverage..."
    npm run test:e2e:cov
    print_success "E2E test coverage generated in coverage-e2e/ directory"
}

# Generate combined coverage report
combined_coverage() {
    print_status "Generating combined coverage report..."
    
    # Run both unit and E2E tests
    unit_coverage
    e2e_coverage
    
    # Create combined directory
    mkdir -p coverage-combined
    
    # Merge coverage reports if nyc is available
    if command -v nyc >/dev/null 2>&1; then
        print_status "Merging coverage reports with nyc..."
        nyc merge coverage coverage-combined/unit.json
        nyc merge coverage-e2e coverage-combined/e2e.json
        nyc report --reporter=html --reporter=text --reporter=json --report-dir=coverage-combined
    else
        print_warning "nyc not found. Install with: npm install -g nyc"
        print_status "Copying coverage reports..."
        cp -r coverage/* coverage-combined/ 2>/dev/null || true
        cp -r coverage-e2e/* coverage-combined/ 2>/dev/null || true
    fi
    
    print_success "Combined coverage report generated in coverage-combined/ directory"
}

# Generate HTML report and open
html_coverage() {
    print_status "Generating HTML coverage report..."
    npm run test:cov:html
    
    # Try to open in browser (works on macOS and Linux with xdg-open)
    if command -v open >/dev/null 2>&1; then
        open coverage/index.html
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open coverage/index.html
    else
        print_warning "Could not auto-open browser. Open coverage/index.html manually."
    fi
    
    print_success "HTML coverage report generated and opened!"
}

# Generate CI-friendly coverage
ci_coverage() {
    print_status "Generating CI-friendly coverage report..."
    npm run test:cov:ci
    
    # Display coverage summary
    if [ -f coverage/coverage-summary.json ]; then
        print_status "Coverage Summary:"
        cat coverage/coverage-summary.json | jq -r '.total | "Lines: \(.lines.pct)% | Functions: \(.functions.pct)% | Branches: \(.branches.pct)% | Statements: \(.statements.pct)%"' 2>/dev/null || \
        echo "Coverage summary available in coverage/coverage-summary.json"
    fi
    
    print_success "CI coverage report generated!"
}

# Check coverage thresholds
check_thresholds() {
    print_status "Checking coverage thresholds..."
    
    # Run tests with coverage and let Jest check thresholds
    if npm run test:cov:ci >/dev/null 2>&1; then
        print_success "All coverage thresholds met! ✅"
    else
        print_error "Coverage thresholds not met! ❌"
        print_status "Run 'npm run test:cov' to see detailed coverage report"
        exit 1
    fi
}

# Generate coverage badge data
generate_badge() {
    print_status "Generating coverage badge data..."
    
    if [ -f coverage/coverage-summary.json ]; then
        COVERAGE=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct' 2>/dev/null || echo "0")
        
        # Determine color based on coverage percentage
        if (( $(echo "$COVERAGE >= 80" | bc -l 2>/dev/null || echo 0) )); then
            COLOR="brightgreen"
        elif (( $(echo "$COVERAGE >= 60" | bc -l 2>/dev/null || echo 0) )); then
            COLOR="yellow"
        else
            COLOR="red"
        fi
        
        BADGE_URL="https://img.shields.io/badge/coverage-${COVERAGE}%25-${COLOR}"
        
        echo "Coverage Badge URL: $BADGE_URL"
        echo "Coverage Percentage: ${COVERAGE}%"
        
        # Save to file
        echo "$BADGE_URL" > coverage/badge-url.txt
        echo "${COVERAGE}%" > coverage/coverage-percentage.txt
        
        print_success "Badge data generated in coverage/ directory"
    else
        print_error "Coverage summary not found. Run coverage first."
        exit 1
    fi
}

# Main script logic
case "${1:-help}" in
    "unit")
        unit_coverage
        ;;
    "e2e")
        e2e_coverage
        ;;
    "combined")
        combined_coverage
        ;;
    "html")
        html_coverage
        ;;
    "ci")
        ci_coverage
        ;;
    "clean")
        clean_coverage
        ;;
    "threshold")
        check_thresholds
        ;;
    "badge")
        generate_badge
        ;;
    "help"|*)
        show_help
        ;;
esac
