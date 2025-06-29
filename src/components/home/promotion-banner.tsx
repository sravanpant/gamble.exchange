"use client";

import { useState, useEffect } from "react";
import { X, Gift, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function PromotionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    // Show banner after 3 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
        >
          <div className="casino-card p-4 sm:p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] via-[#9D00FF] to-[#FF1493]" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Gift
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  style={{ color: "#00D4FF" }}
                />
                <h3 className="text-base sm:text-lg font-bold">
                  Weekend Special!
                </h3>
              </div>

              <p className="text-xl sm:text-2xl font-bold mb-2 casino-gradient-text">
                50% Reload Bonus
              </p>

              <p
                className="text-xs sm:text-sm mb-4"
                style={{ color: "#A0A0B8" }}
              >
                Get 50% bonus up to $500 on your next deposit. Limited time
                offer!
              </p>

              {/* Timer */}
              <div className="flex items-center gap-2 sm:gap-4 mb-4">
                <Clock className="w-4 h-4" style={{ color: "#FF1493" }} />
                <div className="flex gap-1 sm:gap-2">
                  <div className="text-center">
                    <div className="bg-[#1A1A2E] px-2 py-1 rounded font-mono font-bold text-sm">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#666" }}>
                      Hours
                    </p>
                  </div>
                  <div className="text-lg sm:text-xl">:</div>
                  <div className="text-center">
                    <div className="bg-[#1A1A2E] px-2 py-1 rounded font-mono font-bold text-sm">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#666" }}>
                      Minutes
                    </p>
                  </div>
                  <div className="text-lg sm:text-xl">:</div>
                  <div className="text-center">
                    <div className="bg-[#1A1A2E] px-2 py-1 rounded font-mono font-bold text-sm">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#666" }}>
                      Seconds
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/promotions/weekend-special">
                <button className="w-full casino-button flex items-center justify-center gap-2 py-2.5 sm:py-3">
                  <span className="text-sm sm:text-base">Claim Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
