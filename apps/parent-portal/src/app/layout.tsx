import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Elymica Parent Portal',
  description: 'Monitor your child’s progress, attendance, and communications in real time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-sand text-night antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
