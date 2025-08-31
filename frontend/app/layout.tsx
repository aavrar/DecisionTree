import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/components/providers/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Branches - Make Better Decisions',
  description: 'Transform complex choices into clear paths with decision trees, future self reflection, and psychology-informed guidance.',
  generator: 'Branches',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
