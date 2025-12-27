// Cache middleware for frequently accessed data
// Implementa caché en memoria con expiración automática

const cache = new Map();

export function createCacheMiddleware(options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por defecto
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`
  } = options;

  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);
    const cachedData = cache.get(cacheKey);

    if (cachedData && cachedData.expiresAt > Date.now()) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData.data);
    }

    // Remover caché expirado
    if (cachedData && cachedData.expiresAt <= Date.now()) {
      cache.delete(cacheKey);
    }

    // Interceptar res.json para cachear respuestas
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + ttl
      });
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

export function clearCache() {
  cache.clear();
}

export function invalidateCache(pattern) {
  for (const [key] of cache) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    ttl: '5 minutos'
  };
}
