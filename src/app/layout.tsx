// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'MovieApp',
  description: 'Фильмы и отзывы',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning — нужен, т.к. класс .dark применяется инлайн-скриптом
    // до гидрации React, и это намеренно
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/*
          Инлайн-скрипт выполняется СИНХРОННО до рендера страницы.
          Это предотвращает мигание неправильной темы (FOUC).
          Тема по умолчанию — dark, как в оригинальном приложении.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', t === 'dark');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
