import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Range Status',
    short_name: 'Range Status',
    description: 'Check how busy golf driving ranges are before you go',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#26C485',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}