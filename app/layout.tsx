import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

const siteConfig = {
  name: 'Mitraa',
  description: 'Share files, text, and links instantly with no account required. Mitraa is the fastest way to drop content and share it via a temporary room.',
  url: 'https://heydrop.vercel.app', // Placeholder, using a generic vercel URL since I don't know the domain
  ogImage: '/favicon.png',
  author: 'Shivam Pawar',
  twitterHandle: '@shivam154co',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'file sharing',
    'fast file drop',
    'no signup file sharing',
    'instant room sharing',
    'Mitraa',
    'Shivam Pawar',
    'temporary file sharing',
    'secure data transfer',
    'browser based file sharing',
    'P2P sharing alternative',
    'Mitraa by Shivam Pawar',
    'drop file',
    'drop files share instantly',
    'shivam pawar project',
    'shivam pawar dyp',
    'mitraa file share',
    'shivam pawar shivam pawar dyp',
    'best way to share files without login'
  ],
  authors: [{ name: siteConfig.author, url: 'https://shivam154co.github.io' }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Windows, macOS, Android, iOS',
    author: {
      '@type': 'Person',
      name: siteConfig.author,
      url: 'https://shivam154co.github.io',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-brand-dark text-foreground selection:bg-brand-orange selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
