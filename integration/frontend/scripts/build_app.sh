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

echo "Starting React Native build for platform: ${PLATFORM}"

# --- Common Build Setup ---

# Ensure node_modules are available (should be handled by CI workflow, but good for local testing)
if [ ! -d "node_modules" ]; then
  echo "node_modules not found, installing dependencies..."
  npm ci || { echo "Error: npm install failed." >&2; exit 1; }
fi

# --- Platform-specific Build Logic ---

if [ "${PLATFORM}" == "ios" ]; then
  echo "Building iOS app..."

  # Navigate to the iOS directory
  cd ios || { echo "Error: Could not navigate to ios directory." >&2; exit 1; }

  # Install CocoaPods dependencies
  # This assumes you have a Podfile in your ios directory
  echo "Installing CocoaPods dependencies..."
  pod install || { echo "Error: pod install failed." >&2; exit 1; }

  # Build the iOS app using Xcodebuild
  # Replace 'YourApp' with your actual Xcode scheme name
  # Replace 'com.yourcompany.yourapp' with your actual bundle identifier
  # Replace 'YourTeamID' with your Apple Developer Team ID
  # For production builds, ensure you have proper code signing setup (e.g., Fastlane match, or manual provisioning profiles)
  
  # Environment variables for Xcode build
  IOS_SCHEME=${IOS_SCHEME:-"YourApp"} # Default scheme
  IOS_CONFIGURATION=${IOS_CONFIGURATION:-"Release"} # Default configuration
  IOS_BUNDLE_IDENTIFIER=${IOS_BUNDLE_IDENTIFIER:-"com.yourcompany.yourapp"}
  IOS_TEAM_ID=${IOS_TEAM_ID:-"YOUR_APPLE_TEAM_ID"}

  echo "Xcodebuild command: xcodebuild -workspace YourApp.xcworkspace -scheme ${IOS_SCHEME} -configuration ${IOS_CONFIGURATION} -sdk iphoneos -archivePath build/${IOS_SCHEME}.xcarchive clean archive -allowProvisioningUpdates DEVELOPMENT_TEAM=${IOS_TEAM_ID} CODE_SIGN_IDENTITY='Apple Distribution'"

  xcodebuild -workspace "${IOS_SCHEME}.xcworkspace" \
    -scheme "${IOS_SCHEME}" \
    -configuration "${IOS_CONFIGURATION}" \
    -sdk iphoneos \
    -archivePath "build/${IOS_SCHEME}.xcarchive" \
    clean archive \
    -allowProvisioningUpdates \
    DEVELOPMENT_TEAM="${IOS_TEAM_ID}" \
    CODE_SIGN_IDENTITY="Apple Distribution" || { echo "Error: Xcode archive failed." >&2; exit 1; }

  echo "Exporting IPA..."
  # Create an ExportOptions.plist for your specific distribution method (e.g., app-store, ad-hoc, development)
  # Example for App Store distribution:
  # cat << EOF > exportOptions.plist
  # <?xml version="1.0" encoding="UTF-8"?>
  # <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  # <plist version="1.0">
  # <dict>
  #   <key>method</key>
  #   <string>app-store</string>
  #   <key>teamID</key>
  #   <string>${IOS_TEAM_ID}</string>
  #   <key>uploadBitcode</key>
  #   <false/>
  #   <key>uploadSymbols</key>
  #   <true/>
  # </dict>
  # </plist>
  # EOF
  # For simplicity, we'll use a basic export, but a proper plist is recommended.

  # A minimal ExportOptions.plist for App Store Connect (TestFlight/App Store)
  cat << EOF > exportOptions.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key>
	<string>app-store</string>
	<key>teamID</key>
	<string>${IOS_TEAM_ID}</string>
	<key>uploadBitcode</key>
	<false/>
	<key>uploadSymbols</key>
	<true/>
</dict>
</plist>
EOF

  xcodebuild -exportArchive \
    -archivePath "build/${IOS_SCHEME}.xcarchive" \
    -exportOptionsPlist exportOptions.plist \
    -exportPath "build/Release-iphoneos" || { echo "Error: Xcode export failed." >&2; exit 1; }

  echo "iOS build completed. IPA available at: ios/build/Release-iphoneos/"
  cd .. # Go back to root

elif [ "${PLATFORM}" == "android" ]; then
  echo "Building Android app..."

  # Navigate to the Android directory
  cd android || { echo "Error: Could not navigate to android directory." >&2; exit 1; }

  # Create `local.properties` if it doesn't exist (needed for SDK path)
  if [ ! -f "local.properties" ]; then
    echo "sdk.dir=$ANDROID_HOME" > local.properties
  fi

  # Create `gradle.properties` for keystore details if not already present
  # These should ideally be passed as environment variables or secrets in CI
  if [ -n "${ANDROID_KEYSTORE_PATH}" ] && [ -n "${ANDROID_KEYSTORE_PASSWORD}" ] && [ -n "${ANDROID_KEY_ALIAS}" ] && [ -n "${ANDROID_KEY_PASSWORD}" ]; then
    echo "Configuring Android signing properties..."
    cat << EOF > gradle.properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=${ANDROID_KEY_ALIAS}
MYAPP_UPLOAD_STORE_PASSWORD=${ANDROID_KEYSTORE_PASSWORD}
MYAPP_UPLOAD_KEY_PASSWORD=${ANDROID_KEY_PASSWORD}
EOF
  else
    echo "Warning: Android signing properties not fully provided. Build might fail or be unsigned." >&2
  fi

  # Clean and build the release APK
  echo "Running gradlew assembleRelease..."
  ./gradlew clean assembleRelease || { echo "Error: Android build failed." >&2; exit 1; }

  echo "Android build completed. APK available at: android/app/build/outputs/apk/release/"
  cd .. # Go back to root
fi

echo "Build process finished for ${PLATFORM}."
