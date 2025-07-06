// src/app/admin/opinions/create/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '@/store/useStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, ShieldAlert, Home } from 'lucide-react';

export default function AdminOpinionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { ready, authenticated } = usePrivy();
    const { isAdmin, user: appUser, clearUser } = useUserStore();

    useEffect(() => {
        // Only proceed if Privy is ready and we have appUser data
        if (ready && appUser) {
            // Check if user is authenticated AND has admin privileges
            if (!authenticated || !isAdmin) {
                console.warn("Unauthorized access attempt to admin panel. Redirecting.");
                clearUser(); // Clear potentially stale user data
                router.push('/'); // Redirect to home or a login page
            }
        } else if (ready && !authenticated) {
            // If Privy is ready but not authenticated, ensure user is cleared and redirect
            clearUser();
            router.push('/');
        }
    }, [ready, authenticated, isAdmin, appUser, router, clearUser]);

    // Show loading state while authentication is being checked
    if (!ready || !appUser) {
        return (
            <div
                className="flex min-h-screen items-center justify-center text-white"
                style={{ backgroundColor: 'var(--color-casino-background)' }}
            >
                <Card className="casino-card casino-glow border-0 shadow-2xl">
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <div className="relative">
                            <Shield className="h-12 w-12 text-casino-primary animate-pulse" />
                            <Loader2 className="h-6 w-6 animate-spin absolute -top-1 -right-1" style={{ color: 'var(--color-casino-accent)' }} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold casino-gradient-text">
                                Verifying Admin Access
                            </h3>
                            <p className="text-sm opacity-75">
                                Please wait while we validate your credentials...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If authenticated and is admin, render the children (the create opinion page)
    if (authenticated && isAdmin) {
        return (
            <div style={{ backgroundColor: 'var(--color-casino-background)' }} className="min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    {/* Admin Access Confirmation */}
                    <Alert className="mb-6 casino-card border-0 shadow-lg">
                        <Shield className="h-4 w-4" style={{ color: 'var(--color-casino-primary)' }} />
                        <AlertDescription className="text-white">
                            <span className="font-semibold casino-gradient-text">Admin Access Confirmed</span>
                            <span className="opacity-75 ml-2">You have full administrative privileges</span>
                        </AlertDescription>
                    </Alert>

                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center space-x-2 mb-8 text-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/admin')}
                            className="casino-button-secondary px-3 py-1 h-auto text-xs"
                        >
                            <Home className="h-3 w-3 mr-1" />
                            Admin Dashboard
                        </Button>
                        <span className="opacity-50">/</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/admin/opinions')}
                            className="casino-button-secondary px-3 py-1 h-auto text-xs"
                        >
                            Opinion Management
                        </Button>
                        <span className="opacity-50">/</span>
                        <span className="casino-gradient-text font-medium">Create New Event</span>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // Fallback access denied screen
    return (
        <div
            className="flex min-h-screen items-center justify-center text-white p-4"
            style={{ backgroundColor: 'var(--color-casino-background)' }}
        >
            <Card className="casino-card casino-glow border-0 shadow-2xl max-w-md w-full">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-dark)' }}>
                        <ShieldAlert className="h-8 w-8" style={{ color: 'var(--color-casino-accent)' }} />
                    </div>
                    <CardTitle className="text-2xl font-bold casino-gradient-text">
                        Access Denied
                    </CardTitle>
                    <CardDescription className="text-white opacity-75 text-base">
                        You do not have administrative privileges to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="casino-card border-0" style={{ backgroundColor: 'var(--color-casino-dark)' }}>
                        <ShieldAlert className="h-4 w-4" style={{ color: 'var(--color-casino-accent)' }} />
                        <AlertDescription className="text-white opacity-75">
                            Admin access is required to create and manage prediction events.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push('/')}
                            className="casino-button casino-glow-hover w-full font-semibold"
                            size="lg"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Return to Home
                        </Button>

                        <Button
                            onClick={() => router.push('/opinion-trading')}
                            variant="outline"
                            className="casino-button-secondary w-full"
                            size="lg"
                        >
                            View Opinion Markets
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}