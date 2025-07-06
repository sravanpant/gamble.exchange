// src/app/admin/opinions/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Calendar, Clock, Target } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const { walletAddress } = useUserStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [settlementDateTime, setSettlementDateTime] = useState("");
  const [outcomeType, setOutcomeType] = useState("Boolean");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setError("Wallet address not available. Please connect.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": walletAddress,
        },
        body: JSON.stringify({
          title,
          description,
          outcomeType,
          eventDateTime,
          settlementDateTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Event created successfully!");
        setTitle("");
        setDescription("");
        setEventDateTime("");
        setSettlementDateTime("");
        router.push(`/opinion-trading/${data.id}`);
      } else {
        setError(data.error || "Failed to create event.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to create event: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-casino-background)" }}
    >
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--color-casino-primary) 0%, transparent 70%)",
          }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--color-casino-secondary) 0%, transparent 70%)",
          }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="casino-gradient-text text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            {/* <Sparkles className="w-8 h-8" style={{ color: 'var(--color-casino-accent)' }} /> */}
            Create Prediction Event
            {/* <Sparkles className="w-8 h-8" style={{ color: 'var(--color-casino-accent)' }} /> */}
          </h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Set up a new prediction market and watch the community place their
            bets on the future
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="casino-card casino-glow border-2 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold casino-gradient-text">
              Event Configuration
            </CardTitle>
            <CardDescription className="text-base opacity-80">
              Configure your prediction event details and timing
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Title */}
              <div className="space-y-3">
                <Label
                  htmlFor="title"
                  className="text-lg font-semibold flex items-center gap-2"
                >
                  <Target
                    className="w-5 h-5"
                    style={{ color: "var(--color-casino-primary)" }}
                  />
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
                  <Label
                    htmlFor="eventDateTime"
                    className="text-lg font-semibold flex items-center gap-2"
                  >
                    <Calendar
                      className="w-5 h-5"
                      style={{ color: "var(--color-casino-secondary)" }}
                    />
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
                  <Label
                    htmlFor="settlementDateTime"
                    className="text-lg font-semibold flex items-center gap-2"
                  >
                    <Clock
                      className="w-5 h-5"
                      style={{ color: "var(--color-casino-accent)" }}
                    />
                    Settlement Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    id="settlementDateTime"
                    value={settlementDateTime}
                    onChange={(e) => setSettlementDateTime(e.target.value)}
                    required
                    className="h-12 text-base border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm"
                  />
                  <p className="text-sm opacity-70">
                    When the market will be settled and payouts distributed
                  </p>
                </div>
              </div>

              {/* Outcome Type */}
              <div className="space-y-3">
                <Label htmlFor="outcomeType" className="text-lg font-semibold">
                  Outcome Type
                </Label>
                <Select value={outcomeType} onValueChange={setOutcomeType}>
                  <SelectTrigger className="h-12 text-lg border-2 focus:border-casino-primary bg-casino-dark/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select outcome type" />
                  </SelectTrigger>
                  <SelectContent className="bg-casino-card border-casino-primary/30">
                    <SelectItem value="Boolean" className="text-base">
                      Yes/No (Boolean)
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold casino-button casino-glow-hover relative overflow-hidden group"
              >
                {/* Button background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-casino-primary via-casino-secondary to-casino-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Create Prediction Event
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
