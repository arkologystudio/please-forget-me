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

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the project root:



## Running the Application

Start all services using Docker Compose:

```bash
docker-compose up --build -d
```

- **`--build`**: Rebuilds the Docker images if there are changes.
- **`-d`**: Runs the containers in detached mode.

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
