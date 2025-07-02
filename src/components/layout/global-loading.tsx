// src/components/layout/global-loading.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCasinoStore } from '@/store/useStore';

export function GlobalLoading() {
  const { isLoading } = useCasinoStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20 flex items-center justify-center z-[100]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
          Loading Casino Royale...
        </div>
      </div>
    </div>
  );
}