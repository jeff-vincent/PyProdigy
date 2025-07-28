#!/bin/bash

# Lab Thingy Comprehensive Test Runner
# This script runs all tests across the entire Lab Thingy application

set -e  # Exit on any error

echo "🚀 Starting Lab Thingy Comprehensive Test Suite"
echo "=============================================="

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

# Initialize test results
FRONTEND_TESTS_PASSED=false
BACKEND_TESTS_PASSED=false
COVERAGE_THRESHOLD=80

print_status "Setting up test environment..."

# Create test reports directory
mkdir -p test-reports
mkdir -p test-reports/coverage
mkdir -p test-reports/frontend
mkdir -p test-reports/backend

# Test Frontend (React)
print_status "Running Frontend Tests..."
cd frontend

if command -v npm &> /dev/null; then
    print_status "Installing frontend dependencies..."
    npm install --silent
    
    print_status "Running React tests with coverage..."
    if npm test -- --coverage --watchAll=false --testResultsProcessor=jest-junit --coverageReporters=lcov,text,html; then
        FRONTEND_TESTS_PASSED=true
        print_success "Frontend tests passed!"
        
        # Move coverage reports
        if [ -d "coverage" ]; then
            cp -r coverage/* ../test-reports/frontend/
        fi
    else
        print_error "Frontend tests failed!"
    fi
else
    print_warning "npm not found, skipping frontend tests"
fi

cd ..

# Test Backend Services
print_status "Running Backend Tests..."

# Function to test a Python service
test_python_service() {
    local service_name=$1
    local service_path=$2
    
    print_status "Testing $service_name service..."
    
    if [ -d "$service_path" ]; then
        cd "$service_path"
        
        # Install dependencies if requirements.txt exists
        if [ -f "requirements.txt" ]; then
            print_status "Installing $service_name dependencies..."
            pip install -r requirements.txt --quiet || print_warning "Failed to install $service_name requirements"
        fi
        
        # Install testing dependencies
        pip install pytest pytest-asyncio pytest-cov httpx --quiet
        
        # Run tests with coverage
        if find . -name "test_*.py" -o -name "*_test.py" | grep -q .; then
            print_status "Running $service_name tests..."
            if pytest --cov=. --cov-report=html --cov-report=term --cov-report=xml -v; then
                print_success "$service_name tests passed!"
                
                # Move coverage reports
                if [ -d "htmlcov" ]; then
                    mkdir -p "../test-reports/backend/$service_name"
                    cp -r htmlcov/* "../test-reports/backend/$service_name/"
                fi
            else
                print_error "$service_name tests failed!"
                BACKEND_TESTS_PASSED=false
                return 1
            fi
        else
            print_warning "No test files found for $service_name"
        fi
        
        cd - > /dev/null
    else
        print_warning "$service_name service directory not found: $service_path"
    fi
}

# Test all backend services
BACKEND_TESTS_PASSED=true

test_python_service "Auth" "auth" || BACKEND_TESTS_PASSED=false
test_python_service "Compute" "compute/src" || BACKEND_TESTS_PASSED=false
test_python_service "Lessons" "lessons/src" || BACKEND_TESTS_PASSED=false
test_python_service "Users" "users/src" || BACKEND_TESTS_PASSED=false
test_python_service "Video" "video/src" || BACKEND_TESTS_PASSED=false

# Run integration tests if they exist
if [ -d "integration-tests" ]; then
    print_status "Running integration tests..."
    cd integration-tests
    if pytest -v; then
        print_success "Integration tests passed!"
    else
        print_error "Integration tests failed!"
    fi
    cd ..
fi

# Generate comprehensive coverage report
print_status "Generating comprehensive coverage report..."

# Create combined coverage report
cat > test-reports/coverage-summary.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Lab Thingy Test Coverage Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .service { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { border-left: 5px solid #28a745; }
        .failed { border-left: 5px solid #dc3545; }
        .warning { border-left: 5px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Lab Thingy Comprehensive Test Coverage Report</h1>
        <p>Generated on: $(date)</p>
    </div>
    
    <div class="service $([ "$FRONTEND_TESTS_PASSED" = true ] && echo "passed" || echo "failed")">
        <h2>Frontend (React)</h2>
        <p>Status: $([ "$FRONTEND_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")</p>
    </div>
    
    <div class="service $([ "$BACKEND_TESTS_PASSED" = true ] && echo "passed" || echo "failed")">
        <h2>Backend Services</h2>
        <p>Status: $([ "$BACKEND_TESTS_PASSED" = true ] && echo "✅ PASSED" || echo "❌ FAILED")</p>
        <ul>
            <li>Auth Service</li>
            <li>Compute Service</li>
            <li>Lessons Service</li>
            <li>Users Service</li>
            <li>Video Service</li>
        </ul>
    </div>
</body>
</html>
EOF

# Final results
echo ""
echo "=============================================="
echo "🏁 Test Results Summary"
echo "=============================================="

if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_success "Frontend Tests: PASSED"
else
    print_error "Frontend Tests: FAILED"
fi

if [ "$BACKEND_TESTS_PASSED" = true ]; then
    print_success "Backend Tests: PASSED"
else
    print_error "Backend Tests: FAILED"
fi

echo ""
print_status "Test reports generated in: ./test-reports/"
print_status "Coverage summary: ./test-reports/coverage-summary.html"

# Exit with appropriate code
if [ "$FRONTEND_TESTS_PASSED" = true ] && [ "$BACKEND_TESTS_PASSED" = true ]; then
    print_success "🎉 All tests passed!"
    exit 0
else
    print_error "❌ Some tests failed!"
    exit 1
fi