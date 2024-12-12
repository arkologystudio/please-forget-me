#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U mydb; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up and running!"

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting the application..."
exec "$@"