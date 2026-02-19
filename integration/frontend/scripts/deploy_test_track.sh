#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error when substituting.
# The return value of a pipeline is the status of the last command to exit with a non-zero status, or zero if all commands in the pipeline exit successfully.
set -euo pipefail

# --- Input Validation ---

PLATFORM="$1"

if [ -z "${PLATFORM}" ]; then
  echo "Error: No platform specified. Usage: $0 [ios|android]" >&2
  exit 1
fi

if [[ "${PLATFORM}" != "ios" && "${PLATFORM}" != "android" ]]; then
  echo "Error: Invalid platform '${PLATFORM}'. Must be 'ios' or 'android'." >&2
  exit 1
fi

echo "Starting deployment to internal testing tracks for platform: ${PLATFORM}"

# --- Common Deployment Setup (Fastlane) ---

# Ensure Fastlane is installed and configured. This script assumes Fastlane is set up
# in your project (e.g., Gemfile, Fastfile).
# If not, you might need to install it: gem install fastlane

# --- Platform-specific Deployment Logic ---

if [ "${PLATFORM}" == "ios" ]; then
  echo "Deploying iOS app to TestFlight..."

  # Ensure required Fastlane environment variables are set for iOS
  if [ -z "${FASTLANE_USER}" ] || [ -z "${FASTLANE_PASSWORD}" ] || [ -z "${FASTLANE_TEAM_ID}" ]; then
    echo "Error: Missing Fastlane environment variables for iOS deployment (FASTLANE_USER, FASTLANE_PASSWORD, FASTLANE_TEAM_ID)." >&2
    exit 1
  fi

  # Navigate to the iOS directory where your Fastfile is located
  # This assumes your Fastfile is in `ios/fastlane/Fastfile`
  cd ios || { echo "Error: Could not navigate to ios directory." >&2; exit 1; }

  # Run Fastlane lane for TestFlight deployment
  # This assumes you have a 'beta' or similar lane defined in your Fastfile
  # Example: lane :beta do ... end
  echo "Running Fastlane beta lane..."
  bundle exec fastlane beta || { echo "Error: Fastlane iOS deployment failed." >&2; exit 1; }

  echo "iOS app deployed to TestFlight successfully!"
  cd .. # Go back to root

elif [ "${PLATFORM}" == "android" ]; then
  echo "Deploying Android app to Google Play Internal Test Track..."

  # Ensure required Fastlane environment variables are set for Android
  if [ -z "${GOOGLE_APPLICATION_CREDENTIALS}" ] || [ -z "${FASTLANE_PACKAGE_NAME}" ]; then
    echo "Error: Missing Fastlane environment variables for Android deployment (GOOGLE_APPLICATION_CREDENTIALS, FASTLANE_PACKAGE_NAME)." >&2
    exit 1
  fi

  # Navigate to the Android directory where your Fastfile is located
  # This assumes your Fastfile is in `android/fastlane/Fastfile`
  cd android || { echo "Error: Could not navigate to android directory." >&2; exit 1; }

  # Run Fastlane lane for Google Play deployment
  # This assumes you have an 'internal_test' or similar lane defined in your Fastfile
  # Example: lane :internal_test do ... end
  echo "Running Fastlane internal_test lane..."
  bundle exec fastlane internal_test || { echo "Error: Fastlane Android deployment failed." >&2; exit 1; }

  echo "Android app deployed to Google Play Internal Test Track successfully!"
  cd .. # Go back to root
fi

echo "Deployment process finished for ${PLATFORM}."
