import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RegistrarSW from "./RegistrarSW";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.fielty.app'),
  title: {
    default: 'Fielty — Programa de fidelización y puntos para negocios sin app',
    template: '%s',
  },
  description: 'Creá un programa de puntos para tu negocio en 5 minutos. Sin app, sin complicaciones.',
  keywords: ['programa de fidelización', 'programa de puntos', 'fidelización de clientes', 'tarjeta de puntos digital', 'software para negocios Argentina'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: 'Fielty',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  verification: {
    google: 'twKtMF26NclUVIfAV80S9fLYhHk2eUSxUrksWh8j_bs',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.fielty.app/#organization',
      name: 'Fielty',
      url: 'https://www.fielty.app',
      logo: 'https://www.fielty.app/icons/icon-512.png',
      email: 'hola@fielty.app',
      description: 'Programa de fidelización de clientes con puntos por QR, sin app, para negocios físicos en Argentina.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.fielty.app/#website',
      name: 'Fielty',
      url: 'https://www.fielty.app',
      inLanguage: 'es-AR',
      publisher: { '@id': 'https://www.fielty.app/#organization' },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="fielty" />
        <meta name="theme-color" content="#0e0e0e" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-34MTTKMMB8" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-34MTTKMMB8');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RegistrarSW />
        {children}
      </body>
    </html>
  );
}
