'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, isAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!getAccessToken() || !isAdmin()) {
      router.replace('/login');
    } else {
      setOk(true);
    }
  }, [router]);

  if (!ok) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '32px', overflow: 'auto', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
