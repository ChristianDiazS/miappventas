import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /sitemap.xml
 * Genera dinámicamente el sitemap.xml para SEO
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // URLs estáticas
    const baseUrl = process.env.APP_URL || 'https://unpoquitovariado.com';
    
    const staticUrls = [
      { loc: `${baseUrl}/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/products`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/categories`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/contact`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7' },
      { loc: `${baseUrl}/terms`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: '0.5' },
      { loc: `${baseUrl}/privacy`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: '0.5' },
    ];

    // URLs dinámicas de productos
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
    });

    const productUrls = products.map(p => ({
      loc: `${baseUrl}/products/${p.id}`,
      lastmod: p.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    // URLs dinámicas de categorías
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
    });

    const categoryUrls = categories.map(c => ({
      loc: `${baseUrl}/categories/${c.id}`,
      lastmod: c.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    }));

    // Combinar todas las URLs
    const allUrls = [...staticUrls, ...productUrls, ...categoryUrls];

    // Generar XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    allUrls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Responder con content-type XML
    res.type('application/xml').send(xml);
    logger.info(`Sitemap generado con ${allUrls.length} URLs`);
  } catch (error) {
    logger.error(`Error generando sitemap: ${error.message}`);
    res.status(500).json({ error: 'Error generando sitemap' });
  }
});

/**
 * GET /sitemap-index.xml
 * Sitemap index para muchos URLs
 */
router.get('/sitemap-index.xml', (req, res) => {
  try {
    const baseUrl = process.env.APP_URL || 'https://unpoquitovariado.com';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '  </sitemap>\n';
    xml += '</sitemapindex>';

    res.type('application/xml').send(xml);
    logger.info('Sitemap index generado');
  } catch (error) {
    logger.error(`Error generando sitemap index: ${error.message}`);
    res.status(500).json({ error: 'Error generando sitemap' });
  }
});

/**
 * Escapar caracteres especiales en XML
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default router;
