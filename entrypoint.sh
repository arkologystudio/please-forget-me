#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Function to wait for the database to be ready
wait_for_db() {
  echo "Waiting for PostgreSQL..."

  while ! nc -z db 5432; do
    sleep 1
  done

  echo "PostgreSQL is up and running!"
}

wait_for_db

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run Prisma seed
echo "Seeding the database..."
npx prisma db seed

# Start the application
echo "Starting the application..."
exec "$@"