"use client";

import { useEffect, useRef, useState } from "react";
import { useCasinoStore } from "@/store/useStore";
import { WoodenGate } from "@/components/entrance/wooden-gate";
import { Header } from "@/components/layout/header";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Leaderboard } from "@/components/home/leaderboard";
import { GameCards } from "@/components/home/game-cards";
import { PromotionBanner } from "@/components/home/promotion-banner";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturesSection } from "@/components/home/features-section";
import { LiveBetsTicker } from "@/components/home/live-bets-ticker";
import { Footer } from "@/components/layout/footer";
import { SpinnerRoulette } from "@/components/home/spinner-roulette";
import BackgroundMusic, {
  BackgroundMusicHandle,
} from "@/components/home/background-music";

export default function HomePage() {
  const { hasEnteredCasino, enterCasino, checkRecentEntry, setIsLoading } =
    useCasinoStore();
  const [showGate, setShowGate] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const musicRef = useRef<BackgroundMusicHandle>(null);

  useEffect(() => {
    // Check if user entered recently (within 3 minutes)
    const recentEntry = checkRecentEntry();

    if (recentEntry) {
      // Skip the gate if entered recently
      setShowGate(false);
    }

    setIsLoading(false);
    setIsReady(true);
  }, [checkRecentEntry, setIsLoading]);

  const handleEnterCasino = () => {
    enterCasino();
    setShowGate(false);
    musicRef.current?.playMusic();
  };

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-2xl casino-gradient-text">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Background Music */}
      <BackgroundMusic ref={musicRef} />

      {/* Show gate only if not recently entered */}
      {showGate && !checkRecentEntry() && (
        <WoodenGate onEnter={handleEnterCasino} />
      )}

      {/* Show casino content if gate is not shown or user has entered */}
      {(!showGate || hasEnteredCasino) && (
        <>
          <Header />
          <div className="pt-16 min-h-screen animate-fadeIn">
            {/* Hero Section with Carousel */}
            <section className="relative animate-staggerFadeIn">
              <HeroCarousel />
            </section>

            {/* Live Bets Ticker */}
            <section className="animate-staggerFadeIn">
              <LiveBetsTicker />
            </section>

            {/* Games and Leaderboard Section */}
            <section className="max-w-7xl mx-auto px-4 py-8 animate-staggerFadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Games Section - Left Side */}
                <div className="lg:col-span-8">
                  <SpinnerRoulette />
                  <GameCards />
                </div>

                {/* Right Side - Spinner and Leaderboard */}
                <div className="lg:col-span-4 space-y-6">

                  {/* Leaderboard */}
                  <Leaderboard />
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section
              className="py-12 animate-staggerFadeIn"
              style={{ backgroundColor: "#0F0F1E" }}
            >
              <StatsSection />
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 py-12 animate-staggerFadeIn">
              <FeaturesSection />
            </section>

            {/* Footer */}
            <Footer />

            {/* Promotion Banner (Fixed Position) */}
            <PromotionBanner />
          </div>
        </>
      )}
    </>
  );
}
