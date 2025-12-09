# 🚀 GitHub Actions Setup - Quick Start

## ✅ Workflows Listos para Usar

Los siguientes workflows están configurados y listos:

### 1. **test.yml** - Ejecución de Tests
- ✅ Ejecuta tests en Node 18.x y 20.x
- ✅ Genera reportes de cobertura
- ✅ Soporta Codecov (opcional)
- ✅ Comenta resultados en PRs

### 2. **build.yml** - Build & Deploy
- ✅ Construye Frontend con Vite
- ✅ Valida Backend
- ✅ Crea artifacts para deploy
- ✅ Notificaciones en Slack (opcional)

### 3. **quality.yml** - Control de Calidad
- ✅ Verifica tamaños de bundles
- ✅ Valida package.json
- ✅ Reporta dependencias
- ✅ Comenta en PRs

---

## 🔐 Configuración de Secrets (Opcional)

Los workflows funcionan sin secrets, pero puedes agregar para funcionalidad extra:

### Paso 1: Ir a Settings
```
GitHub Repo → Settings → Secrets and variables → Actions
```

### Paso 2: Agregar Secrets Opcionales

#### Para Codecov (Recomendado)
```
Click "New repository secret"
Name: CODECOV_TOKEN
Value: [Tu token de codecov.io]
```

#### Para Slack (Recomendado)
```
Click "New repository secret"
Name: SLACK_WEBHOOK_URL
Value: [Tu webhook URL de Slack]
```

#### Para Snyk (Seguridad)
```
Click "New repository secret"
Name: SNYK_TOKEN
Value: [Tu token de snyk.io]
```

---

## ✨ Verificar Que Todo Funciona

### Opción 1: Hacer un Push
```bash
git add .
git commit -m "Initial commit with CI/CD"
git push origin main
```

Luego ve a:
- GitHub Repo → **Actions** tab
- Deberías ver workflow ejecutando

### Opción 2: Abrir una Pull Request
```bash
git checkout -b test-branch
git push origin test-branch
```

Luego:
- GitHub → "Create Pull Request"
- Los workflows ejecutarán automáticamente

---

## 📊 Dashboard Monitoreo

### Ver Tests en Tiempo Real
1. Repo → **Actions** tab
2. Selecciona el workflow
3. Verifica "test.yml"
4. Presiona Run actual para ver detalles

### Resultados en PRs
- Abre un PR
- Ve a **Checks** tab
- Verá resultados de:
  - Tests (test.yml)
  - Calidad (quality.yml)

---

## 🎯 Status Badges (Opcional)

Agregar badges al README:

```markdown
[![Tests](https://github.com/USERNAME/REPO/actions/workflows/test.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/test.yml)
[![Build](https://github.com/USERNAME/REPO/actions/workflows/build.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

---

## 🔒 Proteger Main Branch (Recomendado)

1. Repo → **Settings** → **Branches**
2. Click "Add rule"
3. Branch name pattern: `main`
4. Activar:
   - ✅ "Require a pull request before merging"
   - ✅ "Require status checks to pass"
   - ✅ Seleccionar "Tests CI/CD Pipeline"
5. Click "Create"

Esto previene merge sin que tests pasen.

---

## 🐛 Troubleshooting Rápido

### Tests no ejecutan
- Verifica que .github/workflows/ exista
- Verifica que test.yml esté presente
- Haz un push para disparar

### Coverage no sube a Codecov
- Verifica que CODECOV_TOKEN esté en secrets
- Si no tienes cuenta, los tests siguen funcionando
- Coverage reportará localmente en console

### Slack no notifica
- Verifica que SLACK_WEBHOOK_URL esté en secrets
- Verifica que el webhook sea válido
- Los tests siguen funcionando sin Slack

---

## 📚 Más Información

- **Detalles completos:** `.github/SETUP_GUIDE.md`
- **Workflows explicados:** `.github/README.md`
- **Codecov docs:** https://docs.codecov.io
- **GitHub Actions:** https://docs.github.com/en/actions

---

## ✅ Verificación Final

```
✅ .github/workflows/test.yml existe
✅ .github/workflows/build.yml existe
✅ .github/workflows/quality.yml existe
✅ codecov.yml existe
✅ Secrets configurados (opcional)
✅ Branch protection configurado (opcional)
✅ Workflows listos para usar
```

---

**Status:** 🟢 Ready to Deploy  
**Updated:** 2025-01-09
