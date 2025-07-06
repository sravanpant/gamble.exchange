'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Event {
  id: string;
  title: string;
  description: string;
  status: string;
  currentYesPrice: string;
  currentNoPrice: string;
  totalYesShares: string;
  totalNoShares: string;
  eventDateTime: string;
  settlementDateTime: string | null;
  winningOutcomeName: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EditEventsPage() {
  const { walletAddress } = useUserStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events', {
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': walletAddress || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const eventsData = await response.json();
        setEvents(eventsData);
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : String(err);
        setError(`Failed to fetch events: ${errorMessage}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchEvents();
    }
  }, [walletAddress]);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-xl casino-gradient-text font-semibold">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <Alert className="max-w-md border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-casino-background)' }}>
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse" 
             style={{ background: 'radial-gradient(circle, var(--color-casino-primary) 0%, transparent 70%)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse" 
             style={{ background: 'radial-gradient(circle, var(--color-casino-secondary) 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative z-10 container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-casino-primary hover:text-casino-accent hover:bg-casino-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
          <h1 className="casino-gradient-text text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Edit className="w-8 h-8" style={{ color: 'var(--color-casino-accent)' }} />
            Edit Events
            <Edit className="w-8 h-8" style={{ color: 'var(--color-casino-accent)' }} />
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Select an event to modify its details, pricing, or status
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search events by title, description, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 casino-card border-border text-foreground focus:ring-casino-primary"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="casino-card border-border backdrop-blur-sm hover:casino-glow-hover transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2 mt-2">
                      {event.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={event.status === 'OPEN' ? 'default' : 'secondary'} 
                    className={`ml-2 flex-shrink-0 ${event.status === 'OPEN' ? 'bg-green-600 hover:bg-green-700' : 'bg-accent hover:bg-accent/80'}`}
                  >
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Event Date:</span>
                    <span className="text-foreground font-medium">
                      {new Date(event.eventDateTime).toLocaleDateString()}
                    </span>
                  </div>
                  {event.settlementDateTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Settlement:</span>
                      <span className="text-foreground font-medium">
                        {new Date(event.settlementDateTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground font-medium">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Price Information */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Yes Price</div>
                    <div className="font-bold text-green-400">
                      {parseFloat(event.currentYesPrice).toFixed(4)} USDC
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">No Price</div>
                    <div className="font-bold text-red-400">
                      {parseFloat(event.currentNoPrice).toFixed(4)} USDC
                    </div>
                  </div>
                </div>

                {/* Trading Volume */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Yes Shares</div>
                    <div className="font-bold text-foreground">
                      {parseFloat(event.totalYesShares).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">No Shares</div>
                    <div className="font-bold text-foreground">
                      {parseFloat(event.totalNoShares).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Winning Outcome (if settled) */}
                {event.status === 'SETTLED' && event.winningOutcomeName && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-xs text-muted-foreground">Winning Outcome</div>
                    <div className="font-bold text-green-400">{event.winningOutcomeName}</div>
                  </div>
                )}

                {/* Edit Button */}
                <Link href={`/admin/opinions/edit/${event.id}`} className="block">
                  <Button className="w-full casino-button casino-glow-hover">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Events Message */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'No events have been created yet'}
            </p>
            <Link href="/admin/opinions/create">
              <Button className="casino-button">
                Create First Event
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 p-4 rounded-lg bg-muted/20">
            <div>
              <div className="text-2xl font-bold text-casino-primary">{events.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {events.filter(e => e.status === 'OPEN').length}
              </div>
              <div className="text-sm text-muted-foreground">Open Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {events.filter(e => e.status === 'SETTLED').length}
              </div>
              <div className="text-sm text-muted-foreground">Settled Events</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 