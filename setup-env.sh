#!/bin/bash
# Set macOS SDK environment variables for Rust builds
export SDKROOT=/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk
export MACOSX_DEPLOYMENT_TARGET=26.0
export CC=clang
export CXX=clang++

# Execute the command passed as arguments
exec "$@"

