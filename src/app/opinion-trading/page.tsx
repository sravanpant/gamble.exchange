// src/app/opinion-trading/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCasinoStore, useUserStore } from '@/store/useStore'; // Ensure path is correct
import { Event as PrismaEvent } from '@/generated/prisma'; // Import Prisma type

// Define a type that matches your Prisma Event model,
// but ensures `outcomes` is included for client-side use.
interface EventWithOutcomes extends PrismaEvent {
  outcomes: {
    id: string;
    name: string;
    description: string | null;
    isWinning: boolean;
    sharesOwned: string; // From Decimal
  }[];
}

export default function OpinionTradingPage() {
  const { setIsLoading } = useCasinoStore();
  const { cryptoBalance, isAdmin } = useUserStore();
  const [events, setEvents] = useState<EventWithOutcomes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EventWithOutcomes[] = await response.json();
        setEvents(data);
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : String(err);
        setError(`Failed to fetch events: ${errorMessage}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    setIsLoading(false);
    setLoading(false);
  }, [setIsLoading]);

  if (loading) return <div className="p-8 text-center text-white">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="min-h-screen text-white p-8" >
      <h1 className="text-4xl font-bold mb-8 text-center casino-gradient-text">
        Opinion Trading Market
      </h1>

      <div className="mb-8 p-6 casino-card casino-glow rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <p className="text-lg mb-2">
            Your Crypto Balance (USDC):
            <span className="font-semibold ml-2" style={{ color: 'var(--color-casino-primary)' }}>
              {parseFloat(cryptoBalance).toFixed(4)}
            </span>
          </p>
          <p className="text-sm opacity-75">Points for casino games remain separate.</p>
        </div>
        {/* Only show create event button if user is an admin */}
        {isAdmin && (
          <Link href="/admin/opinions/create" className="casino-button casino-glow-hover">
            Create New Event (Admin)
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl opacity-75 mb-4">No active events found.</p>
          <p className="casino-gradient-text text-lg">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/opinion-trading/${event.id}`}>
              <div className="casino-card p-6 rounded-lg shadow-lg casino-glow-hover transition-all duration-300 cursor-pointer border hover:shadow-2xl">
                <h2 className="text-2xl font-semibold mb-3 casino-gradient-text">
                  {event.title}
                </h2>
                <p className="opacity-75 mb-6 line-clamp-2">
                  {event.description || 'No description provided.'}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-casino-dark)' }}>
                    <span className="font-medium">Yes Price:</span>
                    <span className="font-bold" style={{ color: 'var(--color-casino-primary)' }}>
                      {event.currentYesPrice.toFixed(4)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-casino-dark)' }}>
                    <span className="font-medium">No Price:</span>
                    <span className="font-bold" style={{ color: 'var(--color-casino-accent)' }}>
                      {event.currentNoPrice.toFixed(4)} USDC
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-opacity-20 text-sm opacity-75 space-y-2" style={{ borderColor: 'var(--color-casino-primary)' }}>
                  <p>
                    <span className="font-medium">Event Date:</span> {new Date(event.eventDateTime).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={`font-semibold ${event.status === 'OPEN' ? 'text-green-500' : 'text-yellow-500'}`}>{event.status.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}