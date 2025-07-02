// src/components/layout/layout-wrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { useCasinoStore } from '@/store/useStore';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useCasinoStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render header/footer during loading or before mount
  if (!mounted || isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}