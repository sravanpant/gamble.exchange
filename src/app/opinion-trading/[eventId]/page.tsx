// src/app/opinion-trading/[eventId]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, useCasinoStore } from '@/store/useStore';
import { Event as PrismaEvent, Holding as PrismaHolding, Outcome as PrismaOutcome } from '@/generated/prisma';
import Decimal from 'decimal.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Define a type for Event with its relations for frontend use

interface EventDetail extends Omit<PrismaEvent, 'currentYesPrice' | 'currentNoPrice' | 'totalYesShares' | 'totalNoShares' | 'eventDateTime' | 'settlementDateTime' | 'createdAt' | 'updatedAt'> {
  // We omit the original fields from PrismaEvent
  // then re-declare them with the types they will be after API transformation

  outcomes: PrismaOutcome[];
  holdings: Pick<PrismaHolding, 'outcomeId' | 'sharesHeld'>[]; // Only relevant fields

  // These are sent as strings from the API
  currentYesPrice: string;
  currentNoPrice: string;
  totalYesShares: string;
  totalNoShares: string;

  // If Date objects are sent as ISO strings, they should be string too
  eventDateTime: string;
  settlementDateTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const { user, walletAddress, cryptoBalance, setCryptoBalance } = useUserStore();
  const { setIsLoading } = useCasinoStore();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState<string>('1');
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [isTrading, setIsTrading] = useState(false);

  // Set global loading to false when component mounts
  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    if (!walletAddress) {
      // Optionally redirect or show a message if not connected
      // router.push('/');
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        setTradeMessage(null);

        // Pass walletAddress in headers for auth validation and fetching user's holdings
        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': walletAddress, // Send wallet address for backend validation
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EventDetail = await response.json();
        setEvent(data);
        if (data.outcomes.length > 0) {
          setSelectedOutcomeId(data.outcomes[0].id); // Select first outcome by default
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Failed to fetch event: ${err.message}`);
          console.error(err);
        } else {
          setError('Failed to fetch event: Unknown error');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // In a real app, you'd also connect to Socket.IO here to listen for real-time price updates
    // const socket = io(); // Assuming socket.io-client is configured
    // socket.on('eventUpdated', (updatedEventData) => {
    //   if (updatedEventData.eventId === eventId) {
    //     setEvent(prev => prev ? { ...prev, ...updatedEventData.newPrices } : null); // Update prices only
    //   }
    // });
    // return () => { socket.disconnect(); };

  }, [eventId, walletAddress]); // Re-fetch if eventId or user's wallet changes

  const handleTrade = async () => {
    if (!user || !event || !selectedOutcomeId || isTrading) return;

    const quantityNum = parseFloat(tradeQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setTradeMessage('Please enter a valid trade quantity.');
      return;
    }

    setIsTrading(true);
    setTradeMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': user.walletAddress, // Send wallet address for backend validation
        },
        body: JSON.stringify({
          outcomeId: selectedOutcomeId,
          tradeType: 'BUY',
          quantity: quantityNum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTradeMessage(`Trade successful! New Crypto Balance: ${parseFloat(data.updatedUserBalance).toFixed(4)} USDC`);
        setCryptoBalance(data.updatedUserBalance.toString()); // Update Zustand store
        // Update local event state with new prices and total shares
        setEvent(prev => prev ? {
          ...prev,
          currentYesPrice: data.updatedEvent.currentYesPrice,
          currentNoPrice: data.updatedEvent.currentNoPrice,
          totalYesShares: new Decimal(data.updatedEvent.totalYesShares).toString(),
          totalNoShares: new Decimal(data.updatedEvent.totalNoShares).toString(),
          // Re-fetch holdings for current user
          holdings: prev.holdings.map(h => h.outcomeId === selectedOutcomeId
            ? { ...h, sharesHeld: new Decimal(h.sharesHeld).plus(new Decimal(quantityNum)) }
            : h
          )
          // A full refetch of the event might be safer: fetchEvent();
        } : null);

        // A full refresh of holdings might be needed if complex:
        const refetchEvent = async () => {
          const res = await fetch(`/api/events/${eventId}`, {
            headers: {
              'Content-Type': 'application/json',
              'x-wallet-address': walletAddress!,
            },
          });
          if (res.ok) {
            const updatedData: EventDetail = await res.json();
            setEvent(updatedData);
          }
        };
        refetchEvent();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setTradeMessage(`An unexpected error occurred: ${err.message}`);
        console.error(err);
      } else {
        setTradeMessage('An unexpected error occurred: Unknown error');
        console.error(err);
      }
    } finally {
      setIsTrading(false);
    }
  }

  const getUserSharesForOutcome = (outcomeId: string) => {
    return event?.holdings.find(h => h.outcomeId === outcomeId)?.sharesHeld || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-casino-background via-purple-900/10 to-casino-background text-white flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-casino-primary spinner-glow" />
          <p className="text-xl casino-gradient-text font-semibold">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-casino-background via-purple-900/10 to-casino-background text-white flex items-center justify-center">
        <Alert className="max-w-md border-destructive bg-destructive/10 backdrop-blur-sm">
          <AlertDescription className="text-destructive font-semibold">Error: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-casino-background via-purple-900/10 to-casino-background text-white flex items-center justify-center">
        <Alert className="max-w-md border-muted bg-muted/20 backdrop-blur-sm">
          <AlertDescription className="text-muted-foreground">Event not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-casino-background via-purple-900/10 to-casino-background text-white flex items-center justify-center">
        <Alert className="max-w-md border-accent bg-accent/10 backdrop-blur-sm">
          <AlertDescription className="text-accent font-semibold">
            Please connect your wallet to view event details and trade.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-background via-purple-900/10 to-casino-background text-white p-8">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <Card className="casino-card border-border backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-casino-primary hover:text-casino-accent hover:bg-casino-primary/10 casino-glow-hover"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to all events
              </Button>
            </div>
            <CardTitle className="text-4xl font-bold casino-gradient-text">{event.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              {event.description || 'No description provided.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="casino-card border-border backdrop-blur-sm animate-staggerFadeIn">
                <CardHeader>
                  <CardTitle className="text-xl casino-gradient-text">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <span className="font-medium text-foreground">Status:</span>
                    <Badge variant={event.status === 'OPEN' ? 'default' : 'secondary'} className={event.status === 'OPEN' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-accent hover:bg-accent/80 text-white'}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <span className="font-medium text-foreground">Event Date:</span>
                    <span className="text-muted-foreground">{new Date(event.eventDateTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <span className="font-medium text-foreground">Settlement Date:</span>
                    <span className="text-muted-foreground">{new Date(event.settlementDateTime || '').toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-border backdrop-blur-sm animate-staggerFadeIn">
                <CardHeader>
                  <CardTitle className="text-xl casino-gradient-text">Market Prices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.outcomes.map(outcome => (
                    <div key={outcome.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                      <span className="font-medium text-foreground">{outcome.name} Price:</span>
                      <span className={`font-bold ${outcome.name === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                        {outcome.name === 'Yes'
                          ? parseFloat(event.currentYesPrice).toFixed(4)
                          : parseFloat(event.currentNoPrice).toFixed(4)} USDC
                      </span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Your Crypto Balance: <span className="font-semibold text-casino-primary">{parseFloat(cryptoBalance).toFixed(4)} USDC</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {event.status === 'OPEN' && (
              <Card className="casino-card border-border backdrop-blur-sm animate-staggerFadeIn">
                <CardHeader>
                  <CardTitle className="text-2xl casino-gradient-text">Place a Trade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="outcome" className="text-foreground font-semibold">Trade Outcome</Label>
                    <Select value={selectedOutcomeId || ''} onValueChange={setSelectedOutcomeId}>
                      <SelectTrigger className="casino-card border-border text-foreground focus:ring-casino-primary">
                        <SelectValue placeholder="Select an outcome" />
                      </SelectTrigger>
                      <SelectContent className="casino-card border-border">
                        {event.outcomes.map(outcome => (
                          <SelectItem key={outcome.id} value={outcome.id} className="text-foreground hover:bg-muted/20">
                            {outcome.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-foreground font-semibold">Quantity of Shares</Label>
                    <Input
                      type="number"
                      id="quantity"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="casino-card border-border text-foreground focus:ring-casino-primary"
                    />
                    {selectedOutcomeId && (
                      <p className="text-sm text-muted-foreground">
                        You own: <span className="font-semibold text-casino-primary">
                          {
                            (() => {
                              const shares = getUserSharesForOutcome(selectedOutcomeId);
                              if (typeof shares === 'string') {
                                return parseFloat(shares).toFixed(4);
                              } else if (shares && typeof shares.toFixed === 'function') {
                                return shares.toFixed(4);
                              }
                              return '0.0000';
                            })()
                          } shares
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleTrade}
                      disabled={isTrading || !selectedOutcomeId || parseFloat(tradeQuantity) <= 0}
                      className="flex-1 casino-button casino-glow-hover bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {isTrading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Trade...
                        </>
                      ) : (
                        `Buy ${selectedOutcomeId ? event.outcomes.find(o => o.id === selectedOutcomeId)?.name : 'Shares'}`
                      )}
                    </Button>
                  </div>



                  {tradeMessage && (
                    <Alert className={tradeMessage.includes('successful') ? 'border-green-500 bg-green-500/10 backdrop-blur-sm' : 'border-destructive bg-destructive/10 backdrop-blur-sm'}>
                      <AlertDescription className={tradeMessage.includes('successful') ? 'text-green-400 font-semibold' : 'text-destructive font-semibold'}>
                        {tradeMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {event.status !== 'OPEN' && (
              <Card className="casino-card border-border backdrop-blur-sm animate-staggerFadeIn">
                <CardContent className="text-center py-8">
                  <Alert className="border-accent bg-accent/10 backdrop-blur-sm">
                    <AlertDescription className="text-accent font-semibold">
                      Trading is closed for this event.
                      {event.status === 'SETTLED' && event.winningOutcomeName && (
                        <div className="mt-2 text-green-400 font-bold">
                          Winning Outcome: {event.winningOutcomeName}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}


          </CardContent>
        </Card>
      </div>
    </div>
  );
}