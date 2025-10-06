# Docker Development Setup

This guide explains how to run the Create Kuji Server using Docker for development.

## Prerequisites

- Docker Desktop (for Windows/Mac) or Docker Engine + Docker Compose (for Linux)
- Docker Compose v2.0 or higher

## Quick Start

### 1. Start the Development Environment

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will:
- Build the Node.js server image
- Start a PostgreSQL database container
- Start the server with hot-reloading enabled
- Run database migrations automatically

### 2. Access the Application

- **Server API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5432 (credentials in docker-compose.dev.yml)

### 3. Stop the Environment

```bash
docker-compose -f docker-compose.dev.yml down
```

To remove volumes (database data) as well:

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Development Workflow

### Hot Reloading

The server uses `ts-node-dev` for hot-reloading. When you modify files in:
- `./src` - Server will automatically restart
- `./prisma` - You'll need to rebuild the container

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Just the server
docker-compose -f docker-compose.dev.yml logs -f server

# Just the database
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Running Commands Inside Container

```bash
# Access server container shell
docker-compose -f docker-compose.dev.yml exec server sh

# Run Prisma commands
docker-compose -f docker-compose.dev.yml exec server npx prisma migrate dev
docker-compose -f docker-compose.dev.yml exec server npx prisma studio

# Run custom scripts
docker-compose -f docker-compose.dev.yml exec server npm run prisma:seed
```

### Database Management

#### Access PostgreSQL CLI

```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U kuji_user -d create_kuji_db
```

#### Run Migrations

```bash
docker-compose -f docker-compose.dev.yml exec server npx prisma migrate dev --name your_migration_name
```

#### Reset Database

```bash
docker-compose -f docker-compose.dev.yml exec server npx prisma migrate reset
```

#### Prisma Studio (Database GUI)

```bash
docker-compose -f docker-compose.dev.yml exec server npx prisma studio
```

Then access at: http://localhost:5555

## Configuration

### Environment Variables

The default configuration is in `docker-compose.dev.yml`. For custom values:

1. Create a `.env.docker` file (gitignored)
2. Add your overrides
3. Update docker-compose to use env_file:

```yaml
server:
  env_file:
    - .env.docker
```

### Database Credentials

**Default Development Credentials:**
- Host: `postgres` (from container) or `localhost` (from host)
- Port: `5432`
- User: `kuji_user`
- Password: `kuji_dev_password`
- Database: `create_kuji_db`

**Connection String:**
```
postgresql://kuji_user:kuji_dev_password@postgres:5432/create_kuji_db?schema=public
```

### Ports

- **3001**: Server API
- **5432**: PostgreSQL database

Change ports in `docker-compose.dev.yml` if needed:

```yaml
ports:
  - "YOUR_PORT:3001"  # Map to different host port
```

## Troubleshooting

### Port Already in Use

If port 3001 or 5432 is already in use:

```bash
# Find what's using the port (PowerShell)
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Stop existing containers
docker-compose -f docker-compose.dev.yml down
```

### Database Connection Issues

If the server can't connect to the database:

```bash
# Check if postgres is healthy
docker-compose -f docker-compose.dev.yml ps

# Check postgres logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart services
docker-compose -f docker-compose.dev.yml restart
```

### Build Issues

If you encounter build errors:

```bash
# Clean rebuild
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### Prisma Client Issues

If Prisma Client is out of sync:

```bash
# Regenerate Prisma Client
docker-compose -f docker-compose.dev.yml exec server npx prisma generate

# Or rebuild the container
docker-compose -f docker-compose.dev.yml up --build
```

### Permission Issues

If you encounter permission errors:

```bash
# On Windows with WSL2, ensure Docker Desktop is running
# Reset ownership (if needed)
docker-compose -f docker-compose.dev.yml exec server chown -R nodejs:nodejs /app
```

## Advanced Usage

### Using SQLite Instead of PostgreSQL

If you prefer SQLite for development:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `docker-compose.dev.yml`:
   ```yaml
   environment:
     DATABASE_URL: "file:./dev.db"
   volumes:
     - ./dev.db:/app/dev.db
   ```

3. Remove postgres service from docker-compose.dev.yml

### Debugging with Breakpoints

To enable debugging:

1. Update `docker-compose.dev.yml` command:
   ```yaml
   command: sh -c "npx prisma migrate deploy && node --inspect=0.0.0.0:9229 -r ts-node/register/transpile-only src/index.ts"
   ```

2. Add port mapping:
   ```yaml
   ports:
     - "3001:3001"
     - "9229:9229"  # Debug port
   ```

3. Connect your IDE debugger to `localhost:9229`

## Production Considerations

This setup is for **development only**. For production:

- Use a production Dockerfile (not Dockerfile.dev)
- Use proper secrets management
- Enable SSL/TLS
- Use environment-specific configurations
- Implement proper logging and monitoring
- Consider using managed database services
- Use multi-stage builds to reduce image size

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
