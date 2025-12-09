# 🚀 Deployment Guide - MiAppVentas

## Overview

Complete deployment guide for MiAppVentas from local development to production using GitHub Actions, Docker, and staging environment.

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Development                          │
│  Local Branch → git push → GitHub Actions CI/CD         │
└──────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Staging                             │
│  staging branch → Auto deploy → Staging Server          │
│  PostgreSQL 17.7 → Test webhooks → Monitor logs         │
└──────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Production                           │
│  GitHub Release → Build image → Container registry      │
│  PostgreSQL 17.7 → Health checks → Monitoring (6h)      │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Prerequisites

### Local Development
- Node.js 18.x
- npm 9.x
- PostgreSQL 17.7
- Git configured

### Staging Environment
- Docker & Docker Compose (optional)
- 2GB RAM minimum
- Linux/Ubuntu host recommended
- PostgreSQL 17.7 service

### Production Environment
- Kubernetes or Docker Swarm (optional)
- 4GB+ RAM
- PostgreSQL 17.7 (managed or self-hosted)
- Nginx/HAProxy reverse proxy
- SSL certificate

---

## 🏗️ Environment Setup

### Step 1: Local Development Setup

```bash
# Clone repository
git clone https://github.com/your-username/miappventas.git
cd miappventas

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
npm run prisma:migrate

# Run tests
npm test

# Start development server
npm run dev
```

### Step 2: Staging Environment Configuration

**Create `.env.staging`**:
```bash
NODE_ENV=staging
DATABASE_URL=postgresql://staging_user:staging_pass@staging-db:5432/miappventas_staging
API_PORT=3001
CORS_ORIGIN=https://staging-app.yourdomain.com
IZIPAY_API_KEY=sk_test_your_staging_key
IZIPAY_MERCHANT_ID=merchant_staging_123
REDIS_URL=redis://staging-redis:6379
LOG_LEVEL=debug
WEBHOOK_SECRET=your_webhook_secret_staging
```

### Step 3: Production Environment Configuration

**Create `.env.production`**:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:strong_password@prod-db:5432/miappventas_prod
API_PORT=3000
CORS_ORIGIN=https://app.yourdomain.com
IZIPAY_API_KEY=sk_live_your_production_key
IZIPAY_MERCHANT_ID=merchant_prod_123
REDIS_URL=redis://prod-redis:6379
LOG_LEVEL=info
WEBHOOK_SECRET=your_webhook_secret_prod
SENTRY_DSN=https://your-sentry-key@sentry.io/project-id
DATADOG_API_KEY=your_datadog_key
```

---

## 📦 Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

### Docker Compose for Staging

```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=postgresql://staging:staging@postgres:5432/miappventas_staging
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  postgres:
    image: postgres:17.7-alpine
    environment:
      - POSTGRES_USER=staging
      - POSTGRES_PASSWORD=staging
      - POSTGRES_DB=miappventas_staging
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U staging"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy to staging**:
```bash
# Build images
docker-compose -f docker-compose.staging.yml build

# Start services
docker-compose -f docker-compose.staging.yml up -d

# Run migrations
docker-compose -f docker-compose.staging.yml exec backend npm run prisma:migrate

# Run tests
docker-compose -f docker-compose.staging.yml exec backend npm test

# View logs
docker-compose -f docker-compose.staging.yml logs -f backend
```

---

## 🌐 GitHub Actions Deployment

### Staging Deployment (Automatic)

1. **Push to staging branch**:
```bash
git checkout staging
git pull origin staging
git merge feature/new-feature
git push origin staging
```

2. **GitHub Actions automatically**:
   - ✅ Runs 326 comprehensive tests
   - ✅ Builds Docker image
   - ✅ Pushes to registry
   - ✅ Deploys to staging (via webhook)
   - ✅ Notifies team on completion

3. **Monitor deployment**:
   - Go to **Actions → deploy-staging** 
   - Watch build and deployment progress
   - Check GitHub Summary for status

### Production Deployment (Manual)

1. **Create GitHub Release**:
```bash
# Via GitHub CLI
gh release create v1.0.0 --notes "Release notes here"

# Or via GitHub UI:
# Go to Releases → New Release
# Tag: v1.0.0
# Title: Release v1.0.0
# Publish
```

2. **GitHub Actions automatically**:
   - ✅ Validates all tests pass (326 tests)
   - ✅ Runs security audit
   - ✅ Builds Docker image with version tag
   - ✅ Uploads release artifacts
   - ✅ Notifies deployment status

3. **Manual production deployment**:
```bash
# Pull Docker image
docker pull your-registry/miappventas/backend:v1.0.0

# Update production environment
export IMAGE_TAG=v1.0.0
docker-compose -f docker-compose.prod.yml pull backend
docker-compose -f docker-compose.prod.yml up -d backend

# Run migrations
docker exec miappventas-backend npm run prisma:migrate

# Verify deployment
curl https://api.yourdomain.com/api/health
```

---

## 📋 Deployment Checklist

### Pre-Staging Deployment
- [ ] All tests passing locally (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Performance benchmarks met (<500ms webhooks)
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database backups taken
- [ ] Monitoring alerts configured

### Pre-Production Deployment
- [ ] Staging deployment successful
- [ ] 24-hour monitoring window passed
- [ ] All webhook logs clean
- [ ] Database performance stable
- [ ] Security scan passed
- [ ] Release notes documented
- [ ] Team notifications sent
- [ ] Rollback plan documented

---

## 🔍 Post-Deployment Validation

### Health Check
```bash
# Check API is responding
curl https://api.yourdomain.com/api/health

# Check database connectivity
curl https://api.yourdomain.com/api/db-health

# Test webhook endpoint
curl -X POST https://api.yourdomain.com/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.completed","orderId":1}'
```

### Monitoring
```bash
# View real-time logs
docker logs -f miappventas-backend

# Check webhook performance
curl https://api.yourdomain.com/api/monitoring/webhooks

# Export webhook logs
curl https://api.yourdomain.com/api/monitoring/webhooks/export > webhook-logs.csv
```

### Performance
```bash
# Test response time
time curl https://api.yourdomain.com/api/products

# Test concurrent load
ab -n 100 -c 10 https://api.yourdomain.com/api/products

# Check memory usage
docker stats miappventas-backend
```

---

## 🚨 Troubleshooting

### Deployment Failed

**Scenario**: Tests fail in GitHub Actions

```bash
# 1. Pull latest code
git pull origin main

# 2. Run tests locally to reproduce
npm test

# 3. Fix failing tests
npm run test -- --verbose

# 4. Commit and push
git add .
git commit -m "Fix failing tests"
git push origin feature-branch
```

**Scenario**: Database migration fails

```bash
# 1. SSH into server
ssh user@staging-server

# 2. Check migration status
docker exec miappventas-backend npm run prisma:migrate

# 3. If stuck, view logs
docker logs miappventas-backend

# 4. Manual rollback if needed
docker exec miappventas-backend npm run prisma:migrate:rollback
```

**Scenario**: Docker image push fails

```bash
# 1. Check Docker registry credentials
echo $DOCKER_REGISTRY_PASSWORD | docker login -u $DOCKER_REGISTRY_USERNAME --password-stdin

# 2. Tag image correctly
docker tag miappventas:latest your-registry/miappventas/backend:latest

# 3. Push
docker push your-registry/miappventas/backend:latest
```

### Monitoring Issues

**High Error Rate (>10%)**:
```bash
# 1. Check webhook logs
docker exec miappventas-backend npm run monitoring:webhooks

# 2. View recent errors
tail -f logs/webhooks-error.log

# 3. Restart service if stuck
docker-compose restart backend
```

**High Latency (>500ms)**:
```bash
# 1. Check database performance
docker exec miappventas-postgres psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"

# 2. Check application metrics
docker stats miappventas-backend

# 3. Scale horizontally if needed
docker-compose up -d --scale backend=3
```

---

## 🔄 Rollback Procedure

### Rollback Staging
```bash
# 1. Revert to previous commit
git revert HEAD
git push origin staging

# 2. GitHub Actions will auto-deploy previous version

# 3. Verify
curl https://staging-api.yourdomain.com/api/health
```

### Rollback Production
```bash
# 1. Get previous image tag
docker images | grep miappventas

# 2. Restart with previous version
export IMAGE_TAG=v1.0.0  # previous version
docker-compose -f docker-compose.prod.yml pull backend
docker-compose -f docker-compose.prod.yml up -d backend

# 3. Verify all is working
curl https://api.yourdomain.com/api/health

# 4. Document rollback
# Notify team with timestamp and reason
```

---

## 📊 Monitoring & Alerts

### Real-time Monitoring
- **Health Checks**: Every 30 seconds
- **Performance Metrics**: Collected continuously
- **Webhook Logs**: Real-time streaming
- **Error Rate**: Alerts if >10%
- **Latency**: Alerts if >500ms

### Alert Channels (Configure in monitoring.yml)
- Slack notifications
- Email alerts
- PagerDuty for critical issues
- GitHub Actions annotations

### Access Monitoring Dashboard
```bash
# Webhook performance
curl https://api.yourdomain.com/api/monitoring/dashboard

# Export metrics
curl https://api.yourdomain.com/api/monitoring/export?format=csv > metrics.csv
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [PostgreSQL Backup/Restore](https://www.postgresql.org/docs/current/backup.html)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## ✅ Deployment Success Checklist

- [ ] All GitHub Actions workflows passed
- [ ] Application health check responding
- [ ] Database connections working
- [ ] Webhook endpoints accepting requests
- [ ] Performance metrics within thresholds
- [ ] Security scan clean
- [ ] Team notifications sent
- [ ] Monitoring dashboard active
- [ ] Logs being collected
- [ ] Backup procedures scheduled

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
