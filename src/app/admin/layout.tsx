// src/app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useCasinoStore, useUserStore } from '@/store/useStore';
import LoadingSpinner from '@/components/layout/loading-spinner'; // Ensure this component exists

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { isAdmin, user: appUser, clearUser } = useUserStore();
  const {setIsLoading} = useCasinoStore();

  useEffect(() => {
    if (ready && appUser) {
      if (!authenticated || !isAdmin) {
        console.warn("Unauthorized access attempt to admin panel. Redirecting.");
        clearUser();
        router.push('/');
      }
    } else if (ready && !authenticated) {
      clearUser();
      router.push('/');
    }
    setIsLoading(false); // Ensure loading state is cleared after auth check
  }, [ready, authenticated, isAdmin, appUser, router, clearUser, setIsLoading]);

  if (!ready || !appUser) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <LoadingSpinner message="Checking admin access..." />
      </div>
    );
  }

  if (authenticated && isAdmin) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <header className="casino-card shadow-lg mb-0" style={{ backgroundColor: 'var(--color-casino-dark)', borderRadius: '0' }}>
          <nav className="max-w-6xl mx-auto flex justify-between items-center p-6">
            <h1 className="text-3xl font-bold casino-gradient-text">Admin Panel</h1>
            <ul className="flex space-x-8">
              <li>
                <Link href="/admin/opinions/create" className="casino-button-secondary hover:bg-opacity-20 transition duration-200 text-sm font-medium">
                  Create Opinion
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="casino-button-secondary hover:bg-opacity-20 transition duration-200 text-sm font-medium">
                  Manage Users
                </Link>
              </li>
              <li>
                <Link href="/" className="casino-button casino-glow-hover text-sm font-medium">
                  Back to Main Site
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-white" style={{ backgroundColor: 'var(--color-casino-background)' }}>
      <div className="p-8 casino-card casino-glow rounded-lg shadow-lg text-center max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-4 casino-gradient-text">Access Denied</h2>
        <p className="opacity-75 mb-6 text-lg">You do not have administrative privileges to access this page.</p>
        <button
          onClick={() => router.push('/')}
          className="casino-button casino-glow-hover font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}