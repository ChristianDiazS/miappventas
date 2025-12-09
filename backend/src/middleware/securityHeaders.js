/**
 * Security Headers Middleware
 * Añade headers de seguridad a todas las respuestas
 */
export function securityHeaders(req, res, next) {
  // X-Content-Type-Options: previene MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: previene clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: activa el XSS filter del navegador
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security: fuerza HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content-Security-Policy: controla qué recursos se pueden cargar
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");

  // Referrer-Policy: controla qué información se envía en el Referer header
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: controla qué APIs se pueden usar
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}
