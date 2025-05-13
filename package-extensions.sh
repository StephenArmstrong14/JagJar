#!/bin/bash

# Create a temporary directory for packaging
mkdir -p /tmp/jagjar-extensions

# Copy Chrome extension
echo "Packaging Chrome extension..."
cp -r extensions/chrome /tmp/jagjar-extensions/

# Copy Firefox extension
echo "Packaging Firefox extension..."
cp -r extensions/firefox /tmp/jagjar-extensions/

# Copy Edge extension
echo "Packaging Edge extension..."
cp -r extensions/edge /tmp/jagjar-extensions/

# Copy Safari extension
echo "Packaging Safari extension..."
cp -r extensions/safari /tmp/jagjar-extensions/

# Copy testing resources
echo "Adding testing resources..."
cp -r testing-resources /tmp/jagjar-extensions/

# Create a tar.gz file
echo "Creating tar.gz archive..."
cd /tmp
tar -czf jagjar-extensions.tar.gz jagjar-extensions

# Move the archive back to the project directory
mv jagjar-extensions.tar.gz /home/runner/${REPL_SLUG}/

# Clean up
rm -rf /tmp/jagjar-extensions

echo "Package created: jagjar-extensions.tar.gz"
echo "You can download this file from the Files panel in Replit."