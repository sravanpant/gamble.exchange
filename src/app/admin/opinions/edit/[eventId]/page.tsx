'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Target, Edit, Save, ArrowLeft } from 'lucide-react';

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
  outcomes: Array<{
    id: string;
    name: string;
  }>;
}

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const { walletAddress } = useUserStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [settlementDateTime, setSettlementDateTime] = useState('');
  const [status, setStatus] = useState('');
  const [winningOutcomeName, setWinningOutcomeName] = useState('');
  const [currentYesPrice, setCurrentYesPrice] = useState('');
  const [currentNoPrice, setCurrentNoPrice] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': walletAddress || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }

        const eventData: Event = await response.json();
        setEvent(eventData);
        
        // Populate form fields
        setTitle(eventData.title);
        setDescription(eventData.description || '');
        setEventDateTime(new Date(eventData.eventDateTime).toISOString().slice(0, 16));
        setSettlementDateTime(eventData.settlementDateTime ? new Date(eventData.settlementDateTime).toISOString().slice(0, 16) : '');
        setStatus(eventData.status);
        setWinningOutcomeName(eventData.winningOutcomeName || '');
        setCurrentYesPrice(parseFloat(eventData.currentYesPrice).toFixed(4));
        setCurrentNoPrice(parseFloat(eventData.currentNoPrice).toFixed(4));
      } catch (err: unknown) {
        const errorMessage = (err instanceof Error) ? err.message : String(err);
        setError(`Failed to fetch event: ${errorMessage}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (walletAddress) {
      fetchEvent();
    }
  }, [eventId, walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Wallet address not available. Please connect.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: {
        title: string;
        description: string;
        status: string;
        eventDateTime: string;
        currentYesPrice: number;
        currentNoPrice: number;
        settlementDateTime?: string;
        winningOutcomeName?: string;
      } = {
        title,
        description,
        status,
        eventDateTime: new Date(eventDateTime).toISOString(),
        currentYesPrice: parseFloat(currentYesPrice),
        currentNoPrice: parseFloat(currentNoPrice),
      };

      if (settlementDateTime) {
        updateData.settlementDateTime = new Date(settlementDateTime).toISOString();
      }

      if (winningOutcomeName && status === 'SETTLED') {
        updateData.winningOutcomeName = winningOutcomeName;
      }

      const response = await fetch(`/api/events/${eventId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress || '',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Event updated successfully!');
        // Update local event state
        setEvent(prev => prev ? { 
          ...prev, 
          ...updateData,
          currentYesPrice: updateData.currentYesPrice.toString(),
          currentNoPrice: updateData.currentNoPrice.toString()
        } : null);
      } else {
        setError(data.error || 'Failed to update event.');
      }
    } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      setError(`Failed to update event: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPricesToOne = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/events/${eventId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress || '',
        },
        body: JSON.stringify({
          currentYesPrice: 1.0,
          currentNoPrice: 1.0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Prices updated to 1.0 USDC each!');
        setCurrentYesPrice('1.0000');
        setCurrentNoPrice('1.0000');
        // Update local event state
        setEvent(prev => prev ? { 
          ...prev, 
          currentYesPrice: '1.0',
          currentNoPrice: '1.0'
        } : null);
      } else {
        setError(data.error || 'Failed to update prices.');
      }
    } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      setError(`Failed to update prices: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-xl casino-gradient-text font-semibold">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <Alert className="max-w-md border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-casino-background)' }}>
        <Alert className="max-w-md">
          <AlertDescription>Event not found.</AlertDescription>
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

      <div className="relative z-10 container mx-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-casino-primary hover:text-casino-accent hover:bg-casino-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="casino-gradient-text text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Edit className="w-8 h-8" style={{ color: 'var(--color-casino-accent)' }} />
            Edit Prediction Event
            <Edit className="w-8 h-8" style={{ color: 'var(--color-casino-accent)' }} />
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Modify the details of your prediction market event
          </p>
        </div>

        {/* Current Event Info */}
        <Card className="casino-card casino-glow border-2 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold casino-gradient-text">
              Current Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm opacity-75">Event ID</Label>
                <p className="font-mono text-sm">{event.id}</p>
              </div>
              <div>
                <Label className="text-sm opacity-75">Status</Label>
                <Badge variant={event.status === 'OPEN' ? 'default' : 'secondary'} className={event.status === 'OPEN' ? 'bg-green-600 hover:bg-green-700' : 'bg-accent hover:bg-accent/80'}>
                  {event.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm opacity-75">Created</Label>
                <p className="text-sm">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm opacity-75">Last Updated</Label>
                <p className="text-sm">{new Date(event.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="casino-card casino-glow border-2 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold casino-gradient-text">
              Event Configuration
            </CardTitle>
            <CardDescription className="text-base opacity-80">
              Update your prediction event details and timing
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: 'var(--color-casino-primary)' }} />
                  Event Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Will Bitcoin reach $100K by end of 2024?"
                  required
                  className="h-12 text-lg border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-lg font-semibold">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional context, rules, or criteria for the event..."
                  rows={4}
                  className="text-base border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm resize-none"
                />
              </div>

              {/* Date/Time Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="eventDateTime" className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--color-casino-secondary)' }} />
                    Event Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    id="eventDateTime"
                    value={eventDateTime}
                    onChange={(e) => setEventDateTime(e.target.value)}
                    required
                    className="h-12 text-base border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm"
                  />
                  <p className="text-sm opacity-70">
                    When the real-world event is expected to happen
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="settlementDateTime" className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: 'var(--color-casino-accent)' }} />
                    Settlement Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    id="settlementDateTime"
                    value={settlementDateTime}
                    onChange={(e) => setSettlementDateTime(e.target.value)}
                    className="h-12 text-base border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm"
                  />
                  <p className="text-sm opacity-70">
                    When the market will be settled and payouts distributed
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label htmlFor="status" className="text-lg font-semibold">
                  Event Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 text-lg border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-casino-card border-casino-primary/30">
                    <SelectItem value="OPEN" className="text-base">Open</SelectItem>
                    <SelectItem value="CLOSED" className="text-base">Closed</SelectItem>
                    <SelectItem value="SETTLED" className="text-base">Settled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Winning Outcome (only for SETTLED events) */}
              {status === 'SETTLED' && (
                <div className="space-y-3">
                  <Label htmlFor="winningOutcomeName" className="text-lg font-semibold">
                    Winning Outcome
                  </Label>
                  <Select value={winningOutcomeName} onValueChange={setWinningOutcomeName}>
                    <SelectTrigger className="h-12 text-lg border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select winning outcome" />
                    </SelectTrigger>
                    <SelectContent className="bg-casino-card border-casino-primary/30">
                      {event.outcomes.map((outcome) => (
                        <SelectItem key={outcome.id} value={outcome.name} className="text-base">
                          {outcome.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Price Management</Label>
                  <Button
                    type="button"
                    onClick={handleSetPricesToOne}
                    disabled={isSaving}
                    variant="outline"
                    className="casino-button-secondary"
                  >
                    Set Both to 1.0 USDC
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="currentYesPrice" className="text-lg font-semibold">
                      Yes Price (USDC)
                    </Label>
                    <Input
                      type="number"
                      id="currentYesPrice"
                      value={currentYesPrice}
                      onChange={(e) => setCurrentYesPrice(e.target.value)}
                      step="0.0001"
                      min="0"
                      max="1"
                      className="h-12 text-lg border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="currentNoPrice" className="text-lg font-semibold">
                      No Price (USDC)
                    </Label>
                    <Input
                      type="number"
                      id="currentNoPrice"
                      value={currentNoPrice}
                      onChange={(e) => setCurrentNoPrice(e.target.value)}
                      step="0.0001"
                      min="0"
                      max="1"
                      className="h-12 text-lg border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <AlertDescription className="text-green-400 font-medium">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-14 text-lg font-bold casino-button casino-glow-hover relative overflow-hidden group"
              >
                {/* Button background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-casino-primary via-casino-secondary to-casino-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Updating Event...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Update Prediction Event
                    </>
                  )}
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 