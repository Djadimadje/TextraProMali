#!/bin/bash

echo "========================================"
echo "  TextPro AI Frontend - One-Click Setup"
echo "========================================"
echo

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    echo
    exit 1
fi

echo "Node.js found! Version:"
node --version

echo
echo "Installing dependencies from requirements.txt..."
echo "This may take a few minutes..."

# Extract package names from requirements.txt and install them
packages=$(grep -v '^#' requirements.txt | grep -v '^$' | grep -v 'Install command' | tr '\n' ' ')
if [ ! -z "$packages" ]; then
    npm install $packages
else
    echo "Could not parse requirements.txt, using package.json instead..."
    npm install
fi

if [ $? -ne 0 ]; then
    echo
    echo "ERROR: Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo
echo "To start the development server, run:"
echo "  npm run dev"
echo
echo "Then open your browser to: http://localhost:3000"
echo
