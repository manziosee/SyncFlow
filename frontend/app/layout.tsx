import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: { default: 'SyncFlow ERP', template: '%s | SyncFlow' },
  description: 'Real-time multiplayer ERP for African businesses — collaborative invoicing, live fleet tracking, AI automation.',
  keywords: ['ERP', 'Rwanda', 'Africa', 'invoicing', 'fleet', 'payroll', 'real-time'],
  openGraph: {
    title: 'SyncFlow — Real-Time Multiplayer ERP',
    description: 'State-synchronized business operating system for African enterprises.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '10px',
                background: '#0F172A',
                color: '#F1F5F9',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22C55E', secondary: '#F0FDF4' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#FEF2F2' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
