#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error when substituting.
# The return value of a pipeline is the status of the last command to exit with a non-zero status, or zero if all commands in the pipeline exit successfully.
set -euo pipefail

echo "Running CI script tests..."

# --- Test 1: Check if backend deploy script exists and is executable ---
BACKEND_DEPLOY_SCRIPT="integration/backend/scripts/deploy_staging.sh"
if [ -f "${BACKEND_DEPLOY_SCRIPT}" ]; then
  echo "PASS: Backend deploy script '${BACKEND_DEPLOY_SCRIPT}' exists."
  if [ -x "${BACKEND_DEPLOY_SCRIPT}" ]; then
    echo "PASS: Backend deploy script '${BACKEND_DEPLOY_SCRIPT}' is executable."
  else
    echo "FAIL: Backend deploy script '${BACKEND_DEPLOY_SCRIPT}' is NOT executable." >&2
    exit 1
  fi
else
  echo "FAIL: Backend deploy script '${BACKEND_DEPLOY_SCRIPT}' does NOT exist." >&2
  exit 1
fi

# --- Test 2: Check if frontend build script exists and is executable ---
FRONTEND_BUILD_SCRIPT="integration/frontend/scripts/build_app.sh"
if [ -f "${FRONTEND_BUILD_SCRIPT}" ]; then
  echo "PASS: Frontend build script '${FRONTEND_BUILD_SCRIPT}' exists."
  if [ -x "${FRONTEND_BUILD_SCRIPT}" ]; then
    echo "PASS: Frontend build script '${FRONTEND_BUILD_SCRIPT}' is executable."
  else
    echo "FAIL: Frontend build script '${FRONTEND_BUILD_SCRIPT}' is NOT executable." >&2
    exit 1
  fi
else
  echo "FAIL: Frontend build script '${FRONTEND_BUILD_SCRIPT}' does NOT exist." >&2
  exit 1
}

# --- Test 3: Check if frontend deploy test track script exists and is executable ---
FRONTEND_DEPLOY_SCRIPT="integration/frontend/scripts/deploy_test_track.sh"
if [ -f "${FRONTEND_DEPLOY_SCRIPT}" ]; then
  echo "PASS: Frontend deploy test track script '${FRONTEND_DEPLOY_SCRIPT}' exists."
  if [ -x "${FRONTEND_DEPLOY_SCRIPT}" ]; then
    echo "PASS: Frontend deploy test track script '${FRONTEND_DEPLOY_SCRIPT}' is executable."
  else
    echo "FAIL: Frontend deploy test track script '${FRONTEND_DEPLOY_SCRIPT}' is NOT executable." >&2
    exit 1
  fi
else
  echo "FAIL: Frontend deploy test track script '${FRONTEND_DEPLOY_SCRIPT}' does NOT exist." >&2
  exit 1
fi

echo "All CI script existence and executability tests passed successfully!"
