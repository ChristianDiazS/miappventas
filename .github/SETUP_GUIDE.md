# 🔐 GitHub Actions - Setup Guide

## Configuración Requerida para CI/CD

Este documento guía la configuración de GitHub Actions para MiAppVentas.

---

## 1️⃣ Secrets Necesarios en GitHub

### Para Testing & Coverage

#### `CODECOV_TOKEN` (Opcional pero Recomendado)
- **Propósito:** Cargar reportes de cobertura a Codecov
- **Cómo obtener:**
  1. Ve a https://app.codecov.io
  2. Conecta con GitHub
  3. Busca tu repositorio
  4. Copia el token en Settings
- **Dónde configurar:**
  - GitHub Repo → Settings → Secrets and variables → Actions
  - Click "New repository secret"
  - Name: `CODECOV_TOKEN`
  - Value: [Tu token de Codecov]

#### `SNYK_TOKEN` (Opcional para Seguridad)
- **Propósito:** Análisis de seguridad de dependencias
- **Cómo obtener:**
  1. Ve a https://snyk.io
  2. Crea cuenta o inicia sesión
  3. Ve a Account Settings
  4. Copia API Token
- **Dónde configurar:**
  - GitHub Repo → Settings → Secrets and variables → Actions
  - Click "New repository secret"
  - Name: `SNYK_TOKEN`
  - Value: [Tu token de Snyk]

### Para Notificaciones

#### `SLACK_WEBHOOK_URL` (Opcional para Notificaciones)
- **Propósito:** Enviar notificaciones a Slack
- **Cómo obtener:**
  1. Ve a https://api.slack.com/apps
  2. Crea una nueva app
  3. Activa "Incoming Webhooks"
  4. Crea un nuevo webhook para tu canal
  5. Copia la URL
- **Dónde configurar:**
  - GitHub Repo → Settings → Secrets and variables → Actions
  - Click "New repository secret"
  - Name: `SLACK_WEBHOOK_URL`
  - Value: [Tu webhook URL]

---

## 2️⃣ Configurar Workflows Disponibles

### ✅ Workflow: Tests CI/CD Pipeline (.github/workflows/test.yml)
**Se ejecuta cuando:**
- Push a `main` o `develop`
- Pull Request a `main` o `develop`

**Qué hace:**
- ✅ Ejecuta tests en Node 18.x y 20.x
- ✅ Genera reportes de cobertura
- ✅ Carga a Codecov
- ✅ Comenta en PRs con resultados

**Pasos:**
1. Código pushado a GitHub
2. GitHub Actions detecta cambios
3. Ejecuta tests automáticamente
4. Genera cobertura
5. Carga resultados a Codecov (si token presente)

---

### ✅ Workflow: Build & Deploy (.github/workflows/build.yml)
**Se ejecuta cuando:**
- Push a `main`
- Tests pasan exitosamente

**Qué hace:**
- ✅ Construye Frontend (npm run build)
- ✅ Valida Backend
- ✅ Crea artifacts para deploy
- ✅ Notifica en Slack

---

### ✅ Workflow: Code Quality (.github/workflows/quality.yml)
**Se ejecuta cuando:**
- Push a `main` o `develop`
- Pull Request a `main` o `develop`

**Qué hace:**
- ✅ Verifica tamaño de bundles
- ✅ Valida package.json
- ✅ Genera reportes de calidad
- ✅ Comenta en PRs

---

## 3️⃣ Configuración del Repositorio

### Branch Protection Rules
Para proteger `main` branch:

1. Ve a Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Activa:
   - ✅ "Require a pull request before merging"
   - ✅ "Dismiss stale pull request approvals when new commits are pushed"
   - ✅ "Require status checks to pass before merging"
   - ✅ Selecciona: "Tests CI/CD Pipeline"
5. Click "Create"

---

## 4️⃣ Configurar Codecov (Opcional)

### Paso 1: Conectar Repositorio
```bash
1. Ve a https://codecov.io
2. Conecta con GitHub
3. Busca tu repositorio
4. Click "Setup"
```

### Paso 2: Badge para README
```markdown
[![codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

### Paso 3: Verificar Uploads
- Después de primer test, verifica:
  - Coverage dashboard en codecov.io
  - Comentarios automáticos en PRs

---

## 5️⃣ Configurar Slack Notifications (Opcional)

### Paso 1: Crear Webhook
```bash
1. Ve a https://api.slack.com/apps
2. Click "Create New App"
3. Selecciona "From scratch"
4. Name: "MiAppVentas CI/CD"
5. Workspace: [Tu workspace]
6. Click "Create App"
```

### Paso 2: Activar Incoming Webhooks
```bash
1. Lado izquierdo: "Incoming Webhooks"
2. Toggle: ON
3. "Add New Webhook to Workspace"
4. Selecciona canal (#deployments, #alerts, etc.)
5. Copia la URL
```

### Paso 3: Agregar a GitHub Secrets
```bash
Settings → Secrets → New Secret
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/...
```

---

## 6️⃣ Monitorear Workflows

### En GitHub
1. Ve a tu repositorio
2. Click "Actions" tab
3. Ver ejecución en tiempo real
4. Click en workflow para detalles

### Logs
```bash
# Ver logs localmente
gh run list --repo USERNAME/REPO
gh run view RUN_ID --repo USERNAME/REPO --log
```

### Troubleshooting
```bash
# Si workflow falla, verifica:
1. Logs de error en GitHub Actions
2. Secrets configurados correctamente
3. package.json existe en frontend y backend
4. Test scripts en package.json
```

---

## 7️⃣ Comandos Útiles

### Ejecutar Localmente
```bash
# Simular workflow localmente (requiere act)
brew install act
cd MiAppVentas
act -l              # Listar workflows
act -j test         # Ejecutar job specific
```

### Ver Status
```bash
# GitHub CLI
gh run list --repo USERNAME/REPO --limit 10
gh run view LATEST --repo USERNAME/REPO
```

---

## 📊 Dashboard de Monitoreo

### Checks por Workflow

| Workflow | Trigger | Status Check |
|----------|---------|--------------|
| test.yml | Push/PR | tests pass |
| build.yml | main | builds succeed |
| quality.yml | Push/PR | quality report |

### Health Indicators
- ✅ Todos los tests pasan
- ✅ Cobertura > 80%
- ✅ Sin dependencias vulnerables
- ✅ Build sin errores

---

## 🔧 Troubleshooting Común

### ❌ "Node version not found"
```yaml
# En workflows, asegura versión válida
node-version: [18.x, 20.x]  # ✅ Correcto
node-version: [18, 20]       # ❌ Incorrecto
```

### ❌ "Permission denied"
```bash
# Verifica secrets están configurados
Settings → Secrets → Verifica CODECOV_TOKEN existe
```

### ❌ "npm ci fails"
```bash
# Asegura package.json está presente
ls frontend/package.json    # Debe existir
ls backend/package.json     # Debe existir
```

### ❌ "Coverage not uploading"
```bash
# Verifica token de Codecov
1. Codecov token es válido
2. Repository token (repo secret) está configurado
3. Archivos coverage-final.json se crean
```

---

## ✨ Verificación Final

Después de configurar, verifica:

```
✅ Workflows creados en .github/workflows/
✅ Secrets configurados en GitHub
✅ Branch protection en main
✅ Primer push dispara workflows
✅ Tests ejecutan exitosamente
✅ Cobertura se reporta
✅ Notificaciones en Slack (si configurado)
```

---

## 📚 Referencias

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Codecov Setup:** https://docs.codecov.io/docs
- **Slack API:** https://api.slack.com/messaging
- **Snyk Integration:** https://snyk.io/docs/github-integration

---

**Última actualización:** 2025-01-09  
**Status:** ✅ Ready for Setup
