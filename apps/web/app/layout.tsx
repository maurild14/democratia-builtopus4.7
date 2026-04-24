import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'DemocratIA', template: '%s | DemocratIA' },
  description: 'A geolocated deliberative democracy platform for civic discourse.',
  keywords: ['democracy', 'deliberation', 'civic', 'AI', 'public policy'],
  openGraph: {
    title: 'DemocratIA',
    description: 'A geolocated deliberative democracy platform for civic discourse.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: 'DemocratIA' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-dvh bg-background font-body antialiased">
        {children}
      </body>
    </html>
  );
}
