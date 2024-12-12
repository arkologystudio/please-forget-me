# Please Forget Me

A scalable web application built with Next.js, TypeScript, and PostgreSQL. All services are containerized using Docker Compose for streamlined development.

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation.
- **TypeScript**: Enhances JavaScript with static typing.
- **PostgreSQL**: Robust relational database system.
- **Prisma**: Modern ORM for database interactions.
- **Docker & Docker Compose**: Containerization and orchestration of services.

## Prerequisites

Ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/download/) (v22 or later)
- [npm](https://www.npmjs.com/get-npm) 

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/please-forget-me.git
   cd please-forget-me
   ```

2. **Set Up Environment Variables**

   Create a `.env` file in the project root:


## Running the Application

Start all services using Docker Compose:

```bash
docker-compose up --build -d
```

- **`--build`**: Rebuilds the Docker images if there are changes.
- **`-d`**: Runs the containers in detached mode.

## Docker Services Overview

The application leverages multiple Docker services orchestrated via Docker Compose to manage different aspects of the system. Here’s a summary of each service and its corresponding role:

- **db (PostgreSQL Database)**
  - **Purpose:** Hosts the PostgreSQL database.
  - **Configuration:** Sets up environment variables for database credentials and initializes the database.
  - **Health Check:** Ensures the database is ready before other services depend on it.

- **migrate (Prisma Migrations)**
  - **Purpose:** Applies database schema migrations to keep the database in sync with the Prisma schema.
  - **Workflow:** Waits for the database to be healthy, applies migrations, and generates the Prisma Client.

- **seed (Database Seeding)**
  - **Purpose:** Populates the database with initial data required for the application to function correctly.
  - **Workflow:** Depends on the successful completion of migrations to ensure that the schema is up-to-date before seeding.

- **app (Next.js Application)**
  - **Purpose:** Runs the Next.js frontend application.
  - **Workflow:** Ensures that all dependencies are met and that the Prisma Client reflects the latest schema before launching the application.

### Volume Management

- **db-data:** Persists PostgreSQL data between container restarts.
- **node_modules:** Shares the node_modules directory across services to maintain consistency in dependencies.

### Service Dependencies

- **migrate** depends on **db** being healthy.
- **seed** depends on **migrate** completing successfully.
- **app** depends on **seed** completing successfully.

This orchestration ensures that the database is properly set up and seeded with initial data before the application starts, maintaining the integrity and readiness of the development environment.


## Running Database Migrations

If migrations are not automatically applied on startup, run them manually:

```bash
exec app npx prisma migrate dev --name init
```

## Accessing the Application

- **Next.js App:** [http://localhost:3000](http://localhost:3000)
- **PostgreSQL Database:** Accessible via `localhost:5432` using a PostgreSQL client (e.g., pgAdmin, DBeaver)

## Email Service

Mailgun is a powerful email delivery service used for sending, receiving, and tracking emails via a simple API. This project integrates Mailgun to handle email communication efficiently, leveraging its robust infrastructure to ensure reliable and scalable email delivery. The implementation uses the Mailgun API to send messages, making it easy to manage transactional emails directly from the application.

## UI Components & Icons

- [ShadCN](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/icons)

## Prisma

Prisma is an ORM for Node.js and TypeScript that makes it easy to work with databases. It provides a type-safe way to interact with your database, making it easier to write and maintain your code.

Models are defined in the `prisma/schema.prisma` file.

Types are generated when the schema is updated after running `npx prisma generate`.

