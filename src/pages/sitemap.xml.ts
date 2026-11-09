import type { APIRoute } from 'astro';
import { apps } from '../data/apps';
import { locales, localPath } from '../i18n';
export const GET: APIRoute = ({ site }) => {
  const routes = ['', 'support', ...apps.flatMap(app => [`apps/${app.slug}`, `apps/${app.slug}/support`, `apps/${app.slug}/privacy`])];
  const urls = routes.flatMap(route => locales.map(locale => `<url><loc>${new URL(localPath(locale, route), site).href}</loc>${locales.map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${new URL(localPath(lang, route), site).href}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${new URL(localPath('en', route), site).href}"/></url>`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
