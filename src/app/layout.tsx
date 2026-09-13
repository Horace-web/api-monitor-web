import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'API Monitor - API Monitoring Platform',
  description: 'Monitor your APIs in real-time with comprehensive health checks and incident alerts.',
  keywords: ['api', 'monitoring', 'health-check', 'incidents', 'uptime'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}