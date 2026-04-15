// src/app/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'CineVault',
  description: 'Your movie platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read user_info cookie on the server — zero latency, no API call needed
  let initialUser = null;
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('user_info')?.value;
    if (raw) initialUser = JSON.parse(decodeURIComponent(raw));
  } catch { /* no cookie or invalid JSON — just skip */ }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* Pass server-read user so Navbar renders instantly with correct state */}
          <Navbar initialUser={initialUser} />
          <main style={{ minHeight: 'calc(100vh - 60px)' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
