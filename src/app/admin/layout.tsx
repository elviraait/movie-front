'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  );

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) return null;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '32px', overflow: 'auto', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
