# Docker Deployment Guide

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)

### 1. Environment Setup

Copy the Docker environment template:
```bash
cp .env.docker .env
```

Edit `.env` and add your Google AI API key:
```bash
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### 2. Build and Run

Start the application with Docker Compose:
```bash
docker-compose up --build
```

Or run in detached mode:
```bash
docker-compose up -d --build
```

### 3. Access the Application

- **Application**: http://localhost:3000
- **Database**: localhost:5432
  - User: `apex_user`
  - Password: `apex_password`
  - Database: `apex_finance`

## 🔧 Docker Commands

### Start Services
```bash
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Execute Commands in Container
```bash
# Access app container shell
docker-compose exec app sh

# Access database
docker-compose exec db psql -U apex_user -d apex_finance
```

## 📦 What's Included

### Services

1. **app** - Next.js Application
   - Port: 3000
   - Built with multi-stage Dockerfile
   - Optimized production build

2. **db** - PostgreSQL Database
   - Port: 5432
   - Persistent data volume
   - Auto-imports backup.sql on first run

### Volumes

- `postgres_data` - Persistent database storage

### Networks

- `apex-network` - Bridge network for service communication

## 🔍 Troubleshooting

### Port Already in Use
If port 3000 or 5432 is already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

### Database Connection Issues

Check if database is healthy:
```bash
docker-compose ps
```

View database logs:
```bash
docker-compose logs db
```

### Application Won't Start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env
   ```

3. Rebuild from scratch:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### Docker Desktop Not Running

**Windows:**
- Start Docker Desktop from Start Menu
- Wait for "Docker Desktop is running" notification

**Error: "cannot connect to Docker daemon"**
- Ensure Docker Desktop is running
- Check Docker settings → Resources → WSL Integration (if using WSL)

## 🚀 Production Deployment

### Build Production Image
```bash
docker build -t apex-finance:latest .
```

### Run Production Container
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="your_production_db_url" \
  -e GOOGLE_AI_API_KEY="your_api_key" \
  --name apex-finance \
  apex-finance:latest
```

### Push to Container Registry

#### Docker Hub
```bash
docker tag apex-finance:latest yourusername/apex-finance:latest
docker push yourusername/apex-finance:latest
```

#### Azure Container Registry
```bash
az acr login --name yourregistry
docker tag apex-finance:latest yourregistry.azurecr.io/apex-finance:latest
docker push yourregistry.azurecr.io/apex-finance:latest
```

## 📊 Health Checks

The database includes a health check that runs every 10 seconds:
```bash
docker-compose ps
```

Look for "healthy" status on the db service.

## 🔄 Database Migrations

If you need to run migrations:
```bash
# Access the app container
docker-compose exec app sh

# Run your migration script
npm run db:migrate
```

## 💾 Backup and Restore

### Backup Database
```bash
docker-compose exec db pg_dump -U apex_user apex_finance > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U apex_user apex_finance < backup.sql
```

## 🧹 Cleanup

### Remove All Containers and Images
```bash
docker-compose down --rmi all -v
```

### Remove Unused Docker Resources
```bash
docker system prune -a
```

---

**Note:** The Dockerfile uses a multi-stage build for optimal image size and security. The final image runs as a non-root user and only includes production dependencies.
