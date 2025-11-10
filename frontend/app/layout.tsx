import type { Metadata } from 'next';
import { Montserrat, Lobster } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const lobster = Lobster({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-lobster',
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Детский центр Лучик',
  description: 'Место, где каждый ребенок — маленькая звезда!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} ${lobster.variable}`}>{children}</body>
    </html>
  );
}
