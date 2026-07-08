import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traintools.es'),
  title: {
    default: 'TrainTools — Gestiona tu negocio fitness',
    template: '%s | TrainTools',
  },
  description: 'Plataforma para entrenadores, nutricionistas y centros wellness: clientes, planes, pagos, citas y seguimiento en un solo lugar.',
  keywords: ['software entrenadores', 'coaching fitness', 'nutricionistas', 'clientes', 'rutinas', 'pagos recurrentes'],
  authors: [{ name: 'TrainTools' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'TrainTools',
    title: 'TrainTools — Gestiona tu negocio fitness',
    description: 'Centraliza clientes, rutinas, nutricion, citas, comunicacion y pagos para escalar tu servicio de coaching.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TrainTools',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080C14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
