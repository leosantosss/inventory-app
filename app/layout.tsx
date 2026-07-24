import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, Geist } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionWrapper from '@/components/SessionWrapper'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-plex-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: "Chycho's Inventory",
  description: "Chycho's Mexican Food — restaurant inventory management",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Chycho's Inventory",
  },
}

export const viewport: Viewport = {
  themeColor: '#1B4332',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${plexSans.variable} font-sans`}>
        <SessionWrapper session={session}>{children}</SessionWrapper>
      </body>
    </html>
  )
}
