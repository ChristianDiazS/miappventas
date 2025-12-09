# 📚 PASO A PASO GITHUB - Guía Completa

**Objetivo**: Subir MiAppVentas a GitHub y configurar GitHub Actions

---

## 🎯 PARTE 1: Preparación Inicial (15 min)

### Paso 1.1: Verificar Git está instalado ✅

```bash
git --version
```

**Esperado**: `git version 2.49.0.windows.1` (o similar)

---

### Paso 1.2: Configurar Git con tu nombre y email

```bash
git config --global user.name "Tu Nombre Completo"
git config --global user.email "tu-email@gmail.com"
```

**Ejemplo**:
```bash
git config --global user.name "Juan Pérez"
git config --global user.email "juan@ejemplo.com"
```

**Verificar**:
```bash
git config --global user.name
git config --global user.email
```

---

### Paso 1.3: Crear cuenta en GitHub (si no la tienes)

1. Ve a: **https://github.com/signup**
2. Ingresa tu email
3. Crea contraseña
4. Completa la verificación
5. Listo ✅

---

## 🔑 PARTE 2: Generar SSH Key (para conectar Git sin contraseña)

### Paso 2.1: Generar SSH Key

```bash
ssh-keygen -t ed25519 -C "tu-email@gmail.com"
```

**Preguntas que aparecerán**:
1. `Enter file in which to save the key`: Presiona ENTER (usa ubicación default)
2. `Enter passphrase`: Presiona ENTER (sin contraseña)
3. `Enter same passphrase again`: Presiona ENTER

**Resultado**: Se crea una key en `C:\Users\tu-usuario\.ssh\id_ed25519`

---

### Paso 2.2: Copiar la SSH Key pública

```bash
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Verás algo como**:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJmQ8L2k... tu-email@gmail.com
```

**Cópialo TODO** (Ctrl+A, Ctrl+C)

---

### Paso 2.3: Agregar SSH Key a GitHub

1. Ve a: **https://github.com/settings/ssh/new**
2. **Title**: Escribe "Mi Laptop Windows"
3. **Key type**: Selecciona "Authentication Key"
4. **Key**: Pega la SSH key que copiaste
5. Click en **"Add SSH key"** ✅

---

## 📦 PARTE 3: Crear Repositorio en GitHub

### Paso 3.1: Crear nuevo repositorio

1. Ve a: **https://github.com/new**
2. **Repository name**: Escribe `miappventas`
3. **Description**: "Plataforma de ventas de electrónica"
4. **Public** o **Private**: Elige lo que prefieras
5. ❌ NO marques "Initialize repository with README"
6. Click en **"Create repository"** ✅

**Importante**: Verás una página con instrucciones. Cópiala, la usaremos.

---

## 🚀 PARTE 4: Inicializar Git en tu proyecto local

### Paso 4.1: Ir al directorio del proyecto

```bash
cd c:\Users\di_vi\MiAppVentas
```

**Verifica que estés aquí**:
```bash
pwd  # En PowerShell
```

---

### Paso 4.2: Inicializar repositorio git

```bash
git init
```

**Resultado**:
```
Initialized empty Git repository in c:\Users\di_vi\MiAppVentas\.git\
```

---

### Paso 4.3: Agregar todos los archivos

```bash
git add .
```

**Verificar** (sin output significa que está bien):
```bash
git status
```

**Esperado**:
```
On branch master

Initial commit

Changes to be committed:
  (new file): .gitignore
  (new file): package.json
  (new file): ...
  ...
```

---

### Paso 4.4: Hacer el primer commit

```bash
git commit -m "Initial commit: MiAppVentas v1.0.0 - Full stack app with webhooks, payments, and CI/CD"
```

**Resultado**:
```
[master (root-commit) abc123def] Initial commit...
 XXX files changed, YYYY insertions(+)
```

---

### Paso 4.5: Renombrar rama a 'main' (estándar moderno)

```bash
git branch -M main
```

**Verificar**:
```bash
git branch
```

**Esperado**: `* main` (con asterisco)

---

## 🔗 PARTE 5: Conectar con GitHub

### Paso 5.1: Agregar el repositorio remoto

**Reemplaza `YOUR_USERNAME` con tu usuario de GitHub**:

```bash
git remote add origin git@github.com:YOUR_USERNAME/miappventas.git
```

**Ejemplo**:
```bash
git remote add origin git@github.com:juanperez/miappventas.git
```

---

### Paso 5.2: Verificar conexión remota

```bash
git remote -v
```

**Esperado**:
```
origin  git@github.com:YOUR_USERNAME/miappventas.git (fetch)
origin  git@github.com:YOUR_USERNAME/miappventas.git (push)
```

---

### Paso 5.3: Push al repositorio

```bash
git push -u origin main
```

**Primera vez**:
- Puede preguntar sobre SSH fingerprint
- Responde: **yes**
- Espera a que termine ✅

**Resultado**:
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
...
To github.com:YOUR_USERNAME/miappventas.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ PARTE 6: Verificar que está en GitHub

### Paso 6.1: Ver en GitHub.com

1. Ve a: **https://github.com/YOUR_USERNAME/miappventas**
2. Deberías ver todos tus archivos ✅

---

## 🔐 PARTE 7: Configurar Secretos de GitHub

### Paso 7.1: Ir a Settings

1. En GitHub, ve a tu repositorio
2. Click en **Settings** (arriba a la derecha)
3. En el menú izquierdo, ve a **Secrets and variables → Actions**

---

### Paso 7.2: Crear secreto DATABASE_URL

1. Click en **New repository secret**
2. **Name**: `DATABASE_URL`
3. **Value**: Tu string de conexión a PostgreSQL

**Ejemplo**:
```
postgresql://postgres:password@localhost:5432/miappventas_dev
```

4. Click en **Add secret** ✅

---

### Paso 7.3: (Opcional) Agregar otros secretos

Si planeas usar Codecov o Snyk:

**CODECOV_TOKEN**:
1. Ve a: https://codecov.io
2. Crea cuenta con GitHub
3. Autoriza GitHub
4. Copia tu token
5. Agrégalo como secreto en GitHub

**SNYK_TOKEN**:
1. Ve a: https://snyk.io
2. Crea cuenta con GitHub
3. Copia tu token
4. Agrégalo como secreto en GitHub

---

## 🧪 PARTE 8: Verificar GitHub Actions

### Paso 8.1: Ver workflows

1. En GitHub, ve a tu repositorio
2. Click en pestaña **Actions**
3. Deberías ver tus workflows:
   - ci-cd.yml
   - deploy-staging.yml
   - release.yml
   - monitoring.yml

---

### Paso 8.2: Esperar a que se ejecute el primer workflow

El workflow `ci-cd.yml` se ejecuta automáticamente cuando haces push.

**Espera**: 8-10 minutos

**Status esperado**:
- ✅ test job
- ✅ lint job
- ✅ performance job
- ✅ security job
- ✅ coverage job
- ✅ notify job

---

## 🎯 PARTE 9: Probando cambios futuros

### Paso 9.1: Hacer cambios locales

```bash
# Edita cualquier archivo
# Por ejemplo, cambiar SESION_FINAL_RESUMEN.md
```

---

### Paso 9.2: Commit y push

```bash
git add .
git commit -m "Update: descripción del cambio"
git push origin main
```

---

### Paso 9.3: Ver workflow ejecutarse

1. Ve a GitHub → Actions
2. Verás un workflow ejecutándose
3. Espera a que termine
4. Si está verde ✅ → Todo bien
5. Si está rojo ❌ → Revisa los logs para arreglarlo

---

## 📋 Checklist Final

Marca estos como completado:

- [ ] Git instalado y configurado (`git config --global`)
- [ ] SSH key generada y agregada a GitHub
- [ ] Repositorio creado en GitHub
- [ ] `git init` ejecutado
- [ ] `git add .` ejecutado
- [ ] `git commit` realizado
- [ ] `git branch -M main` ejecutado
- [ ] `git remote add origin` configurado
- [ ] `git push -u origin main` ejecutado
- [ ] Código visible en GitHub.com
- [ ] Secreto `DATABASE_URL` agregado
- [ ] Workflows aparecen en Actions
- [ ] Primer workflow se está ejecutando

---

## 🆘 Si algo falla

### Error: "Could not read from remote repository"

```bash
# Solución: Verificar SSH key
ssh -T git@github.com
```

**Esperado**:
```
Hi YOUR_USERNAME! You've successfully authenticated...
```

### Error: "Repository already exists"

```bash
# Si ya existe .git
rm -r .git
git init
```

### Error: "Permission denied"

```bash
# Regenerar SSH key
ssh-keygen -t ed25519 -C "tu-email@gmail.com"

# Agregar nueva key a GitHub settings
```

---

## 🎊 ¡Listo!

Ahora tienes:
- ✅ Código en GitHub
- ✅ GitHub Actions configurado
- ✅ Tests corriendo automáticamente
- ✅ Coverage reportado
- ✅ Security scans activos

**Próximo paso**: Deploy a Staging (ver DEPLOYMENT_GUIDE.md)

---

**¿Necesitas ayuda con algún paso específico?**
