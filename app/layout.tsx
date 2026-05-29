import type { Metadata } from 'next'
import { Noto_Sans_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const mono = Noto_Sans_Mono({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Hourr — Time Tracker',
  description: 'Track your time. Understand your patterns. Own your day.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
