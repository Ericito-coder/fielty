import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL('https://fielty.app'),
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

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="fielty" />
        <meta name="theme-color" content="#0e0e0e" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RegistrarSW />
        {children}
      </body>
    </html>
  );
}
