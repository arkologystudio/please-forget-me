#!/usr/bin/env bash
set -e

# Stop and remove the "local-postgres" container if it exists
echo "Stopping local-postgres container..."
docker stop local-postgres 2>/dev/null || true
docker rm local-postgres 2>/dev/null || true

echo "All relevant containers have been stopped and removed."