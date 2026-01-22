#!/bin/bash

# Build script for @drawio/core
set -e

echo "🏗️  Building @drawio/core..."

# Clean previous build
echo "🧹 Cleaning previous build..."
pnpm run clean

# Run TypeScript compiler
echo "📦 Compiling TypeScript..."
pnpm run build

echo "✅ Build completed successfully!"
echo "📂 Output directory: ./dist"