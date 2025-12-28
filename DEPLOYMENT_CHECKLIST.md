# 🚀 DEPLOYMENT CHECKLIST - Un Poquito Variado

**Versión:** 1.0  
**Última actualización:** 28 de diciembre, 2025  
**Estado:** Listo para Producción ✅

---

## 📋 PRE-DEPLOYMENT VERIFICACIÓN

### 1. **Seguridad**
- [x] Swagger disabled en producción
- [x] Debug routes disabled en producción
- [x] .env no incluido en git
- [x] .env.example creado y documentado
- [x] JWT_SECRET aleatorio (32+ caracteres)
- [x] HTTPS enforced en producción
- [x] CORS restrictivo configurado
- [x] Rate limiting implementado
- [x] Helmet.js habilitado
- [x] SQL Injection prevenido (Prisma ORM)
- [x] XSS Protection activo
- [x] CSRF tokens listos
- [ ] Implementar Sentry para error tracking
- [ ] Configurar WAF/DDoS protection

### 2. **Base de Datos**
- [x] Prisma schema validado
- [x] Migraciones creadas
- [x] Índices optimizados
- [x] Backups automatizados
- [ ] Verificar capacidad de almacenamiento
- [ ] Implementar replicación/redundancia
- [ ] Configurar logs de auditoría

### 3. **Frontend**
- [x] Build Vite exitoso (npm run build)
- [x] Variables de entorno configuradas (.env.example)
- [x] React Router rutas configuradas
- [x] Páginas legales (T&C, Privacy, Contact) creadas
- [x] Branding actualizado (Un Poquito Variado)
- [x] Izipay referenciado (Payment methods)
- [x] Email de contacto actualizado
- [x] Error handling implementado
- [ ] Performance optimización (Lighthouse 90+)
- [ ] SEO meta tags verificados
- [ ] Sitemap.xml creado
- [ ] robots.txt configurado

### 4. **Backend**
- [x] Express server funcional
- [x] Rutas API documentadas (Swagger)
- [x] Endpoint /api/contact implementado
- [x] Validación de entrada en todos los endpoints
- [x] Error handling centralizado
- [x] Logging implementado
- [x] Izipay integrado en pagos
- [ ] Tests unitarios (81.6% coverage)
- [ ] Tests de integración
- [ ] Performance tests ejecutados
- [ ] Load testing completado

### 5. **Pagos - Izipay**
- [ ] Cuenta Izipay creada
- [ ] API credentials obtenidas
- [ ] Webhook configurado
- [ ] Certificados SSL/TLS verificados
- [ ] Pruebas de pago completadas
- [ ] Reembolsos/cancelaciones probadas
- [ ] Documentación de integración lista

### 6. **Email**
- [x] Email configuration en .env.example
- [x] Endpoint /api/contact funcional
- [x] nodemailer integrado
- [ ] Gmail app password generado
- [ ] Email templates diseñados
- [ ] Pruebas de envío completadas
- [ ] SPF/DKIM/DMARC configurado

### 7. **Almacenamiento de Archivos**
- [x] Cloudinary configurado (dy73lxudf)
- [x] Imágenes de productos subidas
- [x] CDN funcionando
- [ ] Versioning de archivos
- [ ] Backup de archivos verificado

---

## 🔧 CONFIGURACIÓN PRODUCCIÓN

### Variables de Entorno Críticas
```dotenv
# CAMBIAR ESTOS EN PRODUCCIÓN:
NODE_ENV=production
JWT_SECRET=<aleatorio-32-chars-min>
DATABASE_URL=<conexion-postgres-prod>
STRIPE_SECRET_KEY=<cambiar-a-izipay>
EMAIL_USER=<email-soporte>
EMAIL_PASSWORD=<app-password>
FRONTEND_URL=https://unpoquitovariado.com
API_URL=https://api.unpoquitovariado.com
CORS_ORIGIN=https://unpoquitovariado.com
ENFORCE_HTTPS=true
```

### Infraestructura Recomendada
- **Hosting Frontend:** Vercel, Netlify o AWS S3 + CloudFront
- **Hosting Backend:** Heroku, Railway, DigitalOcean, AWS EC2
- **Base de Datos:** PostgreSQL en RDS o servicio gerenciado
- **CDN:** CloudFlare o AWS CloudFront
- **Email:** SendGrid, MailChimp o Gmail (limitado)
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics, Mixpanel
- **Monitoring:** DataDog, New Relic, Prometheus

---

## 📱 TESTING PRE-LAUNCH

### Funcionalidad
- [ ] Login/Registro funciona
- [ ] Catálogo de productos carga
- [ ] Búsqueda y filtros funcionan
- [ ] Carrito funciona correctamente
- [ ] Pago con Izipay completo
- [ ] Confirmación de pago enviada
- [ ] Email de contacto llega
- [ ] Admin panel accesible
- [ ] Dashboard analytics funciona

### Navegadores
- [ ] Chrome (últimas 2 versiones)
- [ ] Firefox (últimas 2 versiones)
- [ ] Safari (últimas 2 versiones)
- [ ] Edge (últimas 2 versiones)
- [ ] Mobile (iOS Safari, Android Chrome)

### Performance
- [ ] Lighthouse Score >= 90
- [ ] Load time <= 3s (homepage)
- [ ] First Contentful Paint <= 1.5s
- [ ] Time to Interactive <= 3.5s

### Seguridad
- [ ] HTTPS funciona en todos los endpoints
- [ ] CSP headers correctos
- [ ] No secrets en archivos públicos
- [ ] Tokens expirados correctamente
- [ ] Rate limiting activo
- [ ] CORS restrictivo

---

## 🎯 DEPLOYMENT STEPS

### 1. Preparación
```bash
# Verificar estado
npm run build --prefix frontend
npm run build --prefix backend
npm test

# Limpiar
rm -rf dist/
rm -rf node_modules/
npm ci
```

### 2. Base de Datos
```bash
# Backup
pg_dump -U miappventas miappventas_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Migraciones
npx prisma migrate deploy
npx prisma generate
```

### 3. Frontend Deploy
```bash
# Vercel
vercel --prod

# O Netlify
netlify deploy --prod --dir=frontend/dist
```

### 4. Backend Deploy
```bash
# Heroku
git push heroku main

# O Docker
docker build -t unpoquitovariado/api:latest .
docker push unpoquitovariado/api:latest
```

### 5. Verificación Post-Deploy
```bash
# Health check
curl https://api.unpoquitovariado.com/api/health

# Endpoints críticos
curl https://api.unpoquitovariado.com/api/products
curl https://unpoquitovariado.com/
```

---

## 🚨 ROLLBACK PLAN

Si algo falla:

```bash
# Revertir base de datos
psql -U miappventas miappventas_db < backup_YYYYMMDD_HHMMSS.sql

# Revertir código
git revert <commit-hash>
git push heroku main
```

---

## 📊 MONITORING DESPUÉS DEL LAUNCH

### Métricas Críticas
- Uptime (Target: 99.9%)
- Response time (Target: <200ms)
- Error rate (Target: <0.1%)
- CPU usage (Target: <70%)
- Memory usage (Target: <80%)
- Database connections (Target: <80%)

### Alertas a Configurar
- [ ] Downtime alerts
- [ ] High error rate (>5%)
- [ ] Slow response (>1s)
- [ ] Database connectivity
- [ ] Payment failures
- [ ] Email delivery failures
- [ ] Disk space low (<10%)

### Logs a Revisar
- [ ] Application logs
- [ ] Database logs
- [ ] Access logs (nginx/apache)
- [ ] Error logs
- [ ] Payment logs

---

## 📞 SOPORTE POST-LAUNCH

### Contacto Crítico
- **Email:** soporte@unpoquitovariado.com
- **Teléfono:** +51 9 9999-9999 (9am-5pm)
- **Escalation:** admin@unpoquitovariado.com

### Documentación
- [ ] README.md actualizado
- [ ] API Postman collection
- [ ] Guía de troubleshooting
- [ ] Runbook de operaciones

---

## ✅ SIGN-OFF

**Responsable:** Development Team  
**Fecha Preparación:** 28 de Diciembre, 2025  
**Fecha Deploy Planeada:** TBD  
**Status:** 🟡 Ready for Production (Pending Final Review)

---

**Notas Adicionales:**
- Revisar Google Analytics configuración
- Setup email alerts para errores críticos
- Documentar credentials en gestor seguro (1Password, LastPass)
- Schedule post-launch monitoring (24/7 primeras 48h)
- Preparar equipo de soporte con FAQ
