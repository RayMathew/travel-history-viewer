import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { APPNAME, APPDESC, RAY, GITHUBID } from "@/lib/constants";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: APPNAME,
    template: APPNAME,
  },
  description: APPDESC,
  applicationName: APPNAME,
  keywords: [APPNAME, 'Map', 'Google Maps', 'Travel', 'Hike', 'Hiking', 'Bike', 'Biking', 'Travelling', 'Next.js', 'React', 'Typescript', 'Notion API'],
  authors: [{ name: RAY, url: `https://github.com/${GITHUBID}` }],
  creator: RAY,
  publisher: RAY,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: APPNAME,
    description: APPDESC,
    url: "https://travel-history-viewer.vercel.app",
    siteName: APPNAME,
    // images: [],
    type: "website"
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
  twitter: {
    card: 'summary',
    title: APPNAME,
    description: APPDESC,
    siteId: '@RayMathew_',
    creator: '@RayMathew_',
    creatorId: '@RayMathew_',
    // images: ['https://nextjs.org/og.png'], // Must be an absolute URL
  },
  verification: {
    google: 'b4h28dUyRR2JuWGRoDJgfvVB_RGJ9fj8AqssqNr6S90',
    yandex: 'be654a2c5b3b0408',
    yahoo: '9D6F46FAA4F7B92DC9DC5FBF3A877320',
  },
  // appleWebApp: { // uncomment this after you first test how it works without the config
  //   title: APPNAME,
  //   statusBarStyle: 'black-translucent',
  //   startupImage: [
  //     '/assets/startup/apple-touch-startup-image-768x1004.png',
  //     {
  //       url: '/assets/startup/apple-touch-startup-image-1536x2008.png',
  //       media: '(device-width: 768px) and (device-height: 1024px)',
  //     },
  //   ],
  // },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale: 1,
  // userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
