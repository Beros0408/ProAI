import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/chat', '/crm', '/api'],
    },
    sitemap: 'https://proai-saas.vercel.app/sitemap.xml',
  }
}
