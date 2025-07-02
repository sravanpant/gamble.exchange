// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useCasinoStore } from "@/store/useStore";
import { WoodenGate } from "@/components/entrance/wooden-gate";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Leaderboard } from "@/components/home/leaderboard";
import { GameCards } from "@/components/home/game-cards";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturesSection } from "@/components/home/features-section";
import { LiveBetsTicker } from "@/components/home/live-bets-ticker";
import { SpinnerRoulette } from "@/components/home/spinner-roulette";
import BackgroundMusic, {
  BackgroundMusicHandle,
} from "@/components/home/background-music";

export default function HomePage() {
  const { hasEnteredCasino, enterCasino, checkRecentEntry, setIsLoading } =
    useCasinoStore();
  const [showGate, setShowGate] = useState(true);
  const musicRef = useRef<BackgroundMusicHandle>(null);

  useEffect(() => {
    // Check for recent entry
    const recentEntry = checkRecentEntry();
    if (recentEntry) {
      setShowGate(false);
    }

    // Set a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [checkRecentEntry, setIsLoading]);

  const handleEnterCasino = () => {
    enterCasino();
    setShowGate(false);
    musicRef.current?.playMusic();
  };

  return (
    <>
      <BackgroundMusic ref={musicRef} />

      {showGate && !checkRecentEntry() && (
        <WoodenGate onEnter={handleEnterCasino} />
      )}

      {(!showGate || hasEnteredCasino) && (
        <div className="animate-fadeIn">
          {/* Hero Section with Carousel */}
          <section className="relative animate-staggerFadeIn">
            <HeroCarousel />
          </section>

          {/* Live Bets Ticker */}
          <section className="animate-staggerFadeIn">
            <LiveBetsTicker />
          </section>

          {/* Main Content Section */}
          <section className="max-w-7xl mx-auto px-4 py-8 animate-staggerFadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <GameCards />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <SpinnerRoulette />
                <Leaderboard />
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 animate-staggerFadeIn bg-black/20 backdrop-blur-sm">
            <StatsSection />
          </section>

          {/* Features Section */}
          <section className="max-w-7xl mx-auto px-4 py-12 animate-staggerFadeIn">
            <FeaturesSection />
          </section>
        </div>
      )}
    </>
  );
}