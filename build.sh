#!/bin/bash
set -e

echo "Building Optical Shop Order Management System..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build backend
echo ""
echo "Building backend..."
cd backend
npm install --legacy-peer-deps
npm run build
cd ..

# Build frontend
echo ""
echo "Building frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo ""
echo "Build completed successfully!"
