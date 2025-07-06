// src/components/layout/conditional-layout-wrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { LayoutWrapper } from './layout-wrapper';

interface ConditionalLayoutWrapperProps {
    children: React.ReactNode;
}

export function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
    const pathname = usePathname();

    // Check if the current route is an admin route
    const isAdminRoute = pathname.startsWith('/admin');

    // If it's an admin route, render children without the header/footer wrapper
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // For all other routes, use the normal layout wrapper with header/footer
    return <LayoutWrapper>{children}</LayoutWrapper>;
}