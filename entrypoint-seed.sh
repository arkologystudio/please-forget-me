#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Migrations completed successfully."

echo "Seeding database..."
npx prisma db seed


