import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'Mitraa - Share anything instantly',
  description: 'Easily share files, text, or notes with anyone instantly and securely. No login required. Created by Shivam Pawar.',
  generator: 'Next.js',
  applicationName: 'Mitraa',
  authors: [{ name: 'Shivam Pawar', url: 'https://developer-shivam.vercel.app/' }],
  keywords: ['file sharing', 'text sharing', 'Mitraa', 'Shivam Pawar', 'instant sharing', 'no registration', 'secure file transfer','Mitra by shivam pawar','shivam pawar new project','mitraa shivam pawar','shivam pawar file sharing website'],
  creator: 'Shivam Pawar',
  publisher: 'Shivam Pawar',

  openGraph: {
    title: 'Mitraa - Share anything instantly',
    description: 'Send files or text quickly without any login or signup. One-click sharing!',
    siteName: 'Mitraa',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'Mitraa - Share anything instantly',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Mitraa - Share anything instantly',
    description: 'One-click sharing of files and text. Fast, secure, and login-free.',
    creator: '@ShivamPawarDev', 
    images: ['/favicon.png'],
  },

  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },

  themeColor: '#ffffff',
  colorScheme: 'light dark',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  )
}
