import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ordalee',
    short_name: 'Ordalee',
    description: 'Create receipts, track sales, and share instantly on WhatsApp.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FAF9F6',
    theme_color: '#1B4B5A',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}