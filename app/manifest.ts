import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pain de Vie',
    short_name: 'Pain de Vie',
    description: "La Parole chaque matin, une veillée chaque soir, un carnet de lecture et un cursus complet.",
    start_url: '/',
    display: 'standalone',
    background_color: '#FBFBFC',
    theme_color: '#4E6A85',
    lang: 'fr',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
}
