#!/bin/bash

# Build script for Avail DA Capacity Visualization

echo "Building Avail DA Capacity Visualization..."

# Install dependencies
npm install

# Build the project
npm run build

echo "Build completed successfully!"
echo "The build output is in the 'dist' directory."
