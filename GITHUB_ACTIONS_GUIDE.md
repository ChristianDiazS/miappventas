# 🚀 GitHub Actions - CI/CD Documentation

## Overview

MiAppVentas includes 4 complete GitHub Actions workflows for comprehensive CI/CD, testing, security, performance, and production monitoring.

## 📋 Available Workflows

### 1. **ci-cd.yml** - Main Pipeline (On Every Push/PR)
**Trigger**: Push to `main`, `develop`, `staging` branches OR Pull Request

**Jobs**:
- **test** (mandatory) - PostgreSQL service, Prisma migration, comprehensive testing, coverage upload
- **lint** - ESLint validation (continue on error)
- **performance** - Performance metrics collection and artifact storage
- **security** - npm audit + Snyk vulnerability scanning
- **coverage** - Coverage report generation and Codecov upload
- **notify** - Summary notification, fails if tests fail

**Key Features**:
- ✅ PostgreSQL 17.7 service container with health checks
- ✅ Automatic Prisma schema migrations
- ✅ Coverage report upload to Codecov
- ✅ Security scanning with Snyk integration
- ✅ Performance metrics artifact retention (30 days)
- ✅ Fails fast on test failure

**Secrets Required**:
```
CODECOV_TOKEN          (optional, for coverage upload)
SNYK_TOKEN            (optional, for vulnerability scanning)
```

**Environment Variables**:
```
DATABASE_URL          (automatically used from secret)
NODE_ENV              (production)
```

**Example Run**:
```bash
git push origin feature/new-feature
# Automatically triggers workflow
```

---

### 2. **deploy-staging.yml** - Staging Deployment
**Trigger**: Push to `staging` branch

**Jobs**:
- **build** - Install dependencies and prepare package
- **test** - Run test suite against PostgreSQL
- **deploy** - Build Docker image and push to registry (optional)
- **notify** - Deployment status notification

**Key Features**:
- ✅ Automated testing before deployment
- ✅ Docker image building and registry push
- ✅ Deployment via webhook notification
- ✅ GitHub summary with deployment details
- ✅ Environment-specific configuration

**Secrets Required**:
```
DATABASE_URL                (PostgreSQL connection string)
DOCKER_REGISTRY_URL        (optional, for image push)
DOCKER_REGISTRY_USERNAME   (optional)
DOCKER_REGISTRY_PASSWORD   (optional)
STAGING_WEBHOOK_URL        (optional, for deployment notifications)
```

**Deploy Command**:
```bash
git push origin staging
# Automatically builds, tests, and deploys to staging
```

---

### 3. **release.yml** - Production Release
**Trigger**: GitHub Release published OR Manual workflow dispatch

**Jobs**:
- **validate** - PostgreSQL testing, coverage, security audit
- **build-release** - Package creation and artifact upload
- **notify-release** - Release summary notification

**Key Features**:
- ✅ Comprehensive pre-release validation
- ✅ Automatic GitHub release asset upload
- ✅ Docker image tagging (version + latest)
- ✅ Packaged tarball for distribution
- ✅ Security audit before release

**Secrets Required**:
```
DATABASE_URL    (for release validation testing)
```

**Create Release**:
```bash
# Method 1: GitHub UI
# 1. Go to Releases → New Release
# 2. Tag: v1.0.0
# 3. Title: Release v1.0.0
# 4. Publish Release

# Method 2: GitHub CLI
gh release create v1.0.0 --generate-notes

# Automatically triggers validation and packaging
```

**Release Artifacts**:
```
miappventas-backend-v1.0.0.tar.gz
├── backend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── ... (all project files)
├── VERSION (v1.0.0)
└── README
```

---

### 4. **monitoring.yml** - Production Monitoring
**Trigger**: 
- Scheduled: Every 6 hours
- Scheduled: Weekly Monday 9 AM UTC
- Manual workflow dispatch

**Jobs**:
- **health-check** - API and database connectivity verification
- **performance-metrics** - Baseline performance testing
- **security-audit** - Vulnerability scanning
- **webhook-logs-analysis** - Webhook monitoring and alerting
- **dependency-check** - Outdated package detection
- **notification** - Summary report generation

**Key Features**:
- ✅ Automated health monitoring (6-hour intervals)
- ✅ Performance baseline testing
- ✅ Weekly security audits
- ✅ Webhook error rate monitoring (threshold: 10%)
- ✅ Latency monitoring (threshold: 500ms)
- ✅ Outdated dependency detection

**Alert Thresholds**:
```
Error Rate  > 10%      → ⚠️ Warning alert
Latency     > 500ms    → ⚠️ Medium severity
Critical CVE detected  → 🔴 High severity
```

**Manual Health Check**:
```bash
# Via GitHub UI:
# 1. Go to Actions → Production Monitoring
# 2. "Run workflow"
# 3. Select check_type: "health", "performance", "security", or "all"
# 4. Run
```

**Monitoring Reports**:
Reports are generated in GitHub Actions Summary with:
- API health status
- Database connection status
- Performance metrics (webhook, product, auth response times)
- Webhook monitoring stats
- Security vulnerabilities summary
- Dependency status

---

## 🔐 Setup Guide

### Step 1: Initialize GitHub Repository
```bash
cd c:\Users\di_vi\MiAppVentas
git init
git add .
git commit -m "Initial commit: CI/CD pipelines setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/miappventas.git
git push -u origin main
```

### Step 2: Configure Repository Secrets
Go to **Settings → Secrets and variables → Actions** and add:

**Required for CI/CD**:
```
DATABASE_URL = postgresql://user:password@host:port/database_name
```

**Optional but Recommended**:
```
CODECOV_TOKEN = [get from codecov.io]
SNYK_TOKEN = [get from snyk.io]
STAGING_WEBHOOK_URL = [your deployment webhook URL]
DOCKER_REGISTRY_URL = [your docker registry]
DOCKER_REGISTRY_USERNAME = [docker username]
DOCKER_REGISTRY_PASSWORD = [docker token/password]
PRODUCTION_API_URL = [your production API URL]
```

### Step 3: Configure Branch Protection Rules
Go to **Settings → Branches → Branch protection rules**:

For `main` branch:
- ✅ Require status checks to pass (select: test, lint, security)
- ✅ Require branches be up to date before merging
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require code reviews: 1 approval minimum

For `staging` branch:
- ✅ Require status checks to pass (select: test)
- ✅ Allow auto-merge

### Step 4: Enable Actions
- Settings → Actions → General
- ✅ Allow all actions and reusable workflows
- ✅ Set default to most recent versions

---

## 📊 Workflow Status Checks

### Available Status Checks (for branch protection):
```
test          - All tests must pass (326 tests)
lint          - No critical linting errors
performance   - Performance metrics within baselines
security      - No critical/high security issues
```

### Example Branch Protection Configuration:
```yaml
Status Checks Required:
- test (mandatory)
- lint (optional)
- performance (optional)
- security (optional)
```

---

## 🔍 Viewing Workflow Results

### In GitHub UI:
1. Go to **Actions** tab
2. Select workflow (ci-cd, deploy-staging, release, monitoring)
3. Click run to view:
   - Job progress and logs
   - Artifacts generated
   - Test results
   - Coverage reports
   - Security alerts

### Command Line:
```bash
# List all workflow runs
gh run list --repo YOUR_USERNAME/miappventas

# View specific run
gh run view RUN_ID

# Download artifacts
gh run download RUN_ID --dir ./artifacts
```

---

## 📈 Performance Baselines

CI/CD pipeline validates these performance thresholds:

| Operation | Threshold | Status |
|-----------|-----------|--------|
| Webhook processing | < 500ms | ✅ Validated |
| Product listing | < 200ms | ✅ Validated |
| Auth validation | < 100ms | ✅ Validated |
| Database query | < 300ms | ✅ Validated |
| Concurrent load (20) | < 2s | ✅ Validated |

---

## 🚨 Alert Configuration

### Webhook Monitoring Alerts:
```javascript
Error Rate Alert:
- Threshold: > 10%
- Severity: HIGH
- Action: Trigger alert notification

Latency Alert:
- Threshold: > 500ms  
- Severity: MEDIUM
- Action: Log warning

CVE Alert:
- Threshold: Critical/High vulnerability
- Severity: CRITICAL
- Action: Block release
```

---

## 📋 Testing Coverage

Workflows run **326 comprehensive tests** across:
- ✅ Unit tests (productController, userController, orderController)
- ✅ Integration tests (webhooks, Izipay payment system)
- ✅ Performance tests (42 tests, latency, throughput, memory)
- ✅ Security tests (headers, validation, error handling)
- ✅ Monitoring tests (29 tests, metrics, alerts, CSV export)

---

## 🐛 Debugging Workflow Failures

### If tests fail:
```bash
# 1. Check logs in GitHub Actions UI
# 2. Pull latest code
git pull origin main

# 3. Run tests locally
npm test

# 4. Fix issues
npm run test -- --verbose

# 5. Push and retry
git push origin feature-branch
```

### If deployment fails:
```bash
# Check staging environment
curl https://staging-api.example.com/api/health

# Check Docker image
docker pull your-registry/miappventas/backend:latest
docker run --rm your-registry/miappventas/backend:latest npm test

# Check deployment logs in GitHub Actions
```

### If security scan fails:
```bash
# Fix vulnerabilities
npm audit fix

# Review remaining issues
npm audit

# Or, suppress if false positive
npm install --no-save package-name@version
```

---

## 🔄 Workflow Triggers Summary

| Workflow | Trigger | Branch | Run Time |
|----------|---------|--------|----------|
| **ci-cd.yml** | Push/PR | main, develop, staging | ~5-10 min |
| **deploy-staging.yml** | Push | staging | ~10-15 min |
| **release.yml** | Release created | any | ~10-15 min |
| **monitoring.yml** | Schedule (6h/weekly) | main | ~5-10 min |

---

## 📞 Troubleshooting

### "DATABASE_URL not found"
- ✅ Solution: Add `DATABASE_URL` secret in repository settings

### "SNYK_TOKEN missing"
- ✅ Solution: Optional - workflows continue if missing

### "Tests timeout"
- ✅ Solution: Increase timeout in ci-cd.yml: `timeout-minutes: 30`

### "Docker push fails"
- ✅ Solution: Verify DOCKER_REGISTRY secrets and credentials

### "Codecov upload fails"
- ✅ Solution: Optional - ensure CODECOV_TOKEN is set for upload

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Integration](https://docs.codecov.io/docs)
- [Snyk Security Scanning](https://docs.snyk.io/integrations/ci-cd-integrations/github-actions-integration)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Prisma ORM](https://www.prisma.io/docs/)

---

## ✅ Verification Checklist

Before pushing to production:

- [ ] All 326 tests passing locally
- [ ] No linting errors (`npm run lint`)
- [ ] Performance benchmarks met (`npm run test:performance`)
- [ ] Security audit clean (`npm audit`)
- [ ] Database migrations working
- [ ] GitHub Actions secrets configured
- [ ] Branch protection rules set
- [ ] Documentation updated
- [ ] Version tagged and released
- [ ] Monitoring alerts configured

---

**Last Updated**: 2024 | **Version**: 1.0.0
