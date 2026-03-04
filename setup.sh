#!/bin/bash

# Football Club Manager - Quick Setup Script
# Run this after opening the project in Claude Code

set -e

echo "🎮 Football Club Manager - Initial Setup"
echo "========================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required (you have $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
echo "(This may take a minute...)"
npm install
echo "✅ Dependencies installed"
echo ""

# Build domain package
echo "Building domain package..."
cd packages/domain
npm run build
cd ../..
echo "✅ Domain package built"
echo ""

# Run tests
echo "Running tests..."
cd packages/domain
npm test -- --passWithNoTests
cd ../..
echo "✅ Tests passed"
echo ""

echo "========================================"
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Read docs/GETTING_STARTED.md"
echo "  2. Review docs/CONTEXT.md for full background"
echo "  3. Start building in packages/domain/src/"
echo ""
echo "Useful commands:"
echo "  npm test              # Run all tests"
echo "  npm run build         # Build packages"
echo "  npm run test:domain   # Test domain only"
echo ""
echo "Happy coding! 🚀"
