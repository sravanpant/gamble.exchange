// src/components/home/spinner-roulette.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useStore";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Clock, Sparkles, Zap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpinnerSection {
  value: number;
  color: string;
  probability: number;
}

const SPINNER_SECTIONS: SpinnerSection[] = [
  { value: 0, color: "#4B5563", probability: 40 },      // 40% chance
  { value: 10, color: "#3B82F6", probability: 25 },     // 25% chance
  { value: 20, color: "#8B5CF6", probability: 15 },     // 15% chance
  { value: 50, color: "#EC4899", probability: 10 },     // 10% chance
  { value: 100, color: "#F59E0B", probability: 7 },     // 7% chance
  { value: 1000, color: "#10B981", probability: 3 },    // 3% chance
];

const COOLDOWN_HOURS = 24; // 24 hours cooldown
const SKIP_COST = 100; // Points required to skip cooldown
const STORAGE_KEY = 'spinner_last_spin';
const DAILY_SPIN_LIMIT = 10; // Number of spins allowed per day

export function SpinnerRoulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastSpin, setLastSpin] = useState<Date | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(DAILY_SPIN_LIMIT);
  const wheelRef = useRef<HTMLDivElement>(null);

  const { walletAddress, points, updatePoints } = useUserStore();

  // Load last spin time and spin count from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData && walletAddress) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.walletAddress === walletAddress) {
        const savedDate = new Date(parsedData.timestamp);
        const now = new Date();

        // Check if it's a new day
        if (savedDate.toDateString() !== now.toDateString()) {
          // Reset spins for new day
          setSpinsRemaining(DAILY_SPIN_LIMIT);
          setLastSpin(null);
        } else {
          setLastSpin(savedDate);
          setSpinsRemaining(parsedData.spinsRemaining || 0);
        }
      }
    }
  }, [walletAddress]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      if (!lastSpin || spinsRemaining > 0) {
        setCanSpin(spinsRemaining > 0);
        setTimeRemaining(0);
        return;
      }

      const now = Date.now();
      const lastSpinTime = lastSpin.getTime();
      const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
      const timePassed = now - lastSpinTime;

      if (timePassed >= cooldownMs) {
        setCanSpin(true);
        setSpinsRemaining(DAILY_SPIN_LIMIT);
        setTimeRemaining(0);
      } else {
        setCanSpin(false);
        setTimeRemaining(cooldownMs - timePassed);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastSpin, spinsRemaining]);

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  // Calculate weighted random selection
  const getWeightedRandomSection = (): { section: SpinnerSection; index: number } => {
    const totalWeight = SPINNER_SECTIONS.reduce((sum, section) => sum + section.probability, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < SPINNER_SECTIONS.length; i++) {
      random -= SPINNER_SECTIONS[i].probability;
      if (random <= 0) {
        return { section: SPINNER_SECTIONS[i], index: i };
      }
    }

    return { section: SPINNER_SECTIONS[0], index: 0 };
  };

  const handleSkipCooldown = async () => {
    if (points < SKIP_COST) {
      toast.error(`You need ${SKIP_COST} points to skip the cooldown!`);
      return;
    }

    setIsSkipping(true);

    try {
      // Deduct points
      await updatePoints('subtract', SKIP_COST);

      // Reset spins and clear cooldown
      setLastSpin(null);
      setSpinsRemaining(DAILY_SPIN_LIMIT);
      setCanSpin(true);
      localStorage.removeItem(STORAGE_KEY);

      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Cooldown skipped! You have {DAILY_SPIN_LIMIT} spins available.</span>
        </div>,
        {
          style: {
            background: "#1A1A2E",
            color: "#00D4FF",
            border: "1px solid rgba(0, 212, 255, 0.3)"
          }
        }
      );

      setShowSkipDialog(false);
    } catch {
      toast.error("Failed to skip cooldown. Please try again.");
    } finally {
      setIsSkipping(false);
    }
  };

  // Update the handleSpin function:
  const handleSpin = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!canSpin || isSpinning || spinsRemaining <= 0) return;

    setIsSpinning(true);

    // Get weighted random result and store it
    const { section: selectedSection, index: selectedIndex } = getWeightedRandomSection();
    const prizeValue = selectedSection.value; // Store the prize value immediately

    // Calculate rotation to land on the selected section
    // Calculate rotation
    const sectionAngle = 360 / SPINNER_SECTIONS.length;
    const targetAngle = 360 - (selectedIndex * sectionAngle) - (sectionAngle / 2);
    const spins = 5; // Number of full rotations
    const finalRotation = rotation + (spins * 360) + targetAngle + (Math.random() * 20 - 10);

    setRotation(finalRotation);

    // Wait for spin animation to complete
    setTimeout(async () => {
      setIsSpinning(false);

      // Update spins remaining
      const newSpinsRemaining = spinsRemaining - 1;
      setSpinsRemaining(newSpinsRemaining);

      // Save state
      const now = new Date();
      if (newSpinsRemaining === 0) {
        setLastSpin(now);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        walletAddress,
        timestamp: now.toISOString(),
        spinsRemaining: newSpinsRemaining
      }));

      // Use the prize value we stored at the beginning
      if (prizeValue > 0) {
        // Update points in the database
        await updatePoints('add', prizeValue);

        // Celebration effect
        if (prizeValue >= 100) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span>You won {prizeValue} points!</span>
          </div>,
          {
            duration: 5000,
            style: {
              background: "#1A1A2E",
              color: "#00D4FF",
              border: "1px solid rgba(0, 212, 255, 0.3)"
            }
          }
        );
      } else {
        toast.error("Better luck next time! You won 0 points.", {
          duration: 3000,
          style: {
            background: "#1A1A2E",
            color: "#FF1493",
            border: "1px solid rgba(255, 20, 147, 0.3)"
          }
        });
      }

      // Show remaining spins if any
      if (newSpinsRemaining > 0) {
        setTimeout(() => {
          toast.info(
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{newSpinsRemaining} {newSpinsRemaining === 1 ? 'spin' : 'spins'} remaining today!</span>
            </div>,
            {
              duration: 3000,
              style: {
                background: "#1A1A2E",
                color: "#00D4FF",
                border: "1px solid rgba(0, 212, 255, 0.3)"
              }
            }
          );
        }, 1000);
      }
    }, 4000); // Spin duration
  };

  const { hours, minutes, seconds } = formatTimeRemaining(timeRemaining);
  const sectionAngle = 360 / SPINNER_SECTIONS.length;
  const showTimer = spinsRemaining === 0 && timeRemaining > 0;

  return (
    <div className="casino-card p-6 mb-6 overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-center casino-gradient-text flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5" />
        Daily Spin Wheel
        <Sparkles className="w-5 h-5" />
      </h2>

      {/* Spins remaining indicator */}
      {spinsRemaining > 0 && (
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            Spins remaining today:{" "}
            <span className="font-bold text-cyan-400">{spinsRemaining}/{DAILY_SPIN_LIMIT}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-8 px-4">
        {/* Spinner Container */}
        <motion.div
          className="relative"
          animate={{
            x: showTimer ? -50 : 0
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* Enhanced Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 blur-xl">
                  <div
                    className="w-16 h-16 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, transparent 70%)"
                    }}
                  />
                </div>

                {/* Main pointer */}
                <div className="relative">
                  <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-2xl">
                    {/* Outer ring */}
                    <circle
                      cx="30"
                      cy="30"
                      r="28"
                      fill="none"
                      stroke="url(#pointerGradient)"
                      strokeWidth="3"
                      className="animate-pulse"
                    />

                    {/* Inner pointer */}
                    <path
                      d="M30 10 L40 35 L30 32 L20 35 Z"
                      fill="url(#pointerGradient)"
                      stroke="#1A1A2E"
                      strokeWidth="1"
                    />

                    {/* Center dot */}
                    <circle
                      cx="30"
                      cy="30"
                      r="4"
                      fill="#00D4FF"
                      stroke="#1A1A2E"
                      strokeWidth="1"
                    />

                    <defs>
                      <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="100%" stopColor="#FF1493" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Wheel Container */}
            <div className="relative aspect-square w-[300px]">
              <motion.div
                ref={wheelRef}
                className="absolute inset-0"
                animate={{ rotate: rotation }}
                transition={{
                  duration: 4,
                  ease: [0.17, 0.55, 0.55, 1],
                  times: [0, 1]
                }}
              >
                {/* Wheel sections */}
                <svg viewBox="0 0 300 300" className="w-full h-full filter drop-shadow-xl">
                  {SPINNER_SECTIONS.map((section, index) => {
                    const startAngle = index * sectionAngle;
                    const endAngle = (index + 1) * sectionAngle;
                    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

                    const x1 = 150 + 150 * Math.cos(startAngleRad);
                    const y1 = 150 + 150 * Math.sin(startAngleRad);
                    const x2 = 150 + 150 * Math.cos(endAngleRad);
                    const y2 = 150 + 150 * Math.sin(endAngleRad);

                    const pathData = [
                      `M 150 150`,
                      `L ${x1} ${y1}`,
                      `A 150 150 0 0 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');

                    // Calculate text position
                    const midAngle = (startAngle + endAngle) / 2;
                    const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                    const textX = 150 + 100 * Math.cos(midAngleRad);
                    const textY = 150 + 100 * Math.sin(midAngleRad);

                    return (
                      <g key={index}>
                        <path
                          d={pathData}
                          fill={section.color}
                          stroke="#1A1A2E"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize="20"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                        >
                          {section.value}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center circle */}
                  <circle
                    cx="150"
                    cy="150"
                    r="35"
                    fill="#1A1A2E"
                    stroke="url(#centerGradient)"
                    strokeWidth="4"
                  />

                  <defs>
                    <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00D4FF" />
                      <stop offset="100%" stopColor="#FF1493" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Center button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={handleSpin}
                  disabled={!walletAddress || isSpinning || !canSpin}
                  className="z-10 rounded-full w-24 h-24 p-0 font-bold text-base transition-all duration-300"
                  style={{
                    background: isSpinning
                      ? "rgba(26, 26, 46, 0.9)"
                      : canSpin
                        ? "linear-gradient(135deg, #00D4FF 0%, #FF1493 100%)"
                        : "rgba(75, 85, 99, 0.5)",
                    boxShadow: canSpin ? "0 4px 20px rgba(0, 212, 255, 0.4)" : "none"
                  }}
                >
                  {isSpinning ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </motion.div>
                  ) : (
                    "SPIN"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timer Section - Only shows when all spins are used */}
        <AnimatePresence>
          {showTimer && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4"
            >
              {/* Timer Display */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm text-gray-400">Next {DAILY_SPIN_LIMIT} spins in:</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Hours */}
                  <motion.div
                    key={hours}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-cyan-400">{String(hours).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">HRS</span>
                  </motion.div>

                  <span className="text-xl font-bold text-gray-500">:</span>

                  {/* Minutes */}
                  <motion.div
                    key={minutes}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-cyan-400">{String(minutes).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">MIN</span>
                  </motion.div>

                  <span className="text-xl font-bold text-gray-500">:</span>

                  {/* Seconds */}
                  <motion.div
                    key={seconds}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-cyan-400">{String(seconds).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">SEC</span>
                  </motion.div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${((COOLDOWN_HOURS * 60 * 60 * 1000 - timeRemaining) / (COOLDOWN_HOURS * 60 * 60 * 1000)) * 100}%`
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Skip Button */}
              <motion.button
                onClick={() => setShowSkipDialog(true)}
                disabled={points < SKIP_COST}
                whileHover={{ scale: points >= SKIP_COST ? 1.05 : 1 }}
                whileTap={{ scale: points >= SKIP_COST ? 0.95 : 1 }}
                className="relative overflow-hidden px-5 py-2.5 rounded-full font-medium transition-all duration-300 disabled:cursor-not-allowed text-sm"
                style={{
                  background: points >= SKIP_COST
                    ? "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                    : "rgba(75, 85, 99, 0.2)",
                  border: points >= SKIP_COST
                    ? "1px solid rgba(0, 212, 255, 0.3)"
                    : "1px solid rgba(75, 85, 99, 0.3)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <span className={`relative z-10 flex items-center gap-2 ${points >= SKIP_COST
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'
                  : 'text-gray-500'
                  }`}>
                  <Zap className={`w-3.5 h-3.5 ${points >= SKIP_COST ? 'text-purple-400' : ''}`} />
                  Skip ({SKIP_COST} pts)
                </span>
              </motion.button>

              {points < SKIP_COST && (
                <p className="text-center text-[10px] text-red-400">
                  Need {SKIP_COST - points} more points
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show message when can spin */}
        <AnimatePresence>
          {canSpin && spinsRemaining > 0 && !showTimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-8 top-1/2 transform -translate-y-1/2"
            >
              <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ready to spin!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Cooldown Confirmation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent
          className="border-0 overflow-hidden"
          style={{
            background: "rgba(26, 26, 46, 0.95)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.2)"
          }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="relative">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <div className="absolute inset-0 blur-lg">
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Skip Cooldown Timer
                </span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 mt-2">
                Are you sure you want to spend{" "}
                <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  {SKIP_COST} points
                </span>{" "}
                to skip the cooldown timer and get {DAILY_SPIN_LIMIT} new spins immediately?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-6 p-5 rounded-xl backdrop-blur-sm"
              style={{
                background: "rgba(15, 15, 30, 0.6)",
                border: "1px solid rgba(0, 212, 255, 0.2)"
              }}
            >
              <div className="space-y-3">
                {/* Current Balance */}
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-gray-400                   flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
                    Current Balance
                  </span>
                  <span className="text-lg font-bold text-cyan-400 flex items-center gap-1">
                    <motion.span
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {points}
                    </motion.span>
                    pts
                  </span>
                </div>

                {/* Cost to Skip */}
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400/50" />
                    Cost to Skip
                  </span>
                  <span className="text-lg font-bold text-red-400 flex items-center gap-1">
                    <motion.span
                      initial={{ x: 0 }}
                      animate={{ x: [-2, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      -{SKIP_COST}
                    </motion.span>
                    pts
                  </span>
                </div>

                {/* Divider with gradient */}
                <div className="relative py-2">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                </div>

                {/* Balance After */}
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400/50" />
                    Balance After
                  </span>
                  <span className={`text-lg font-bold flex items-center gap-1 ${points - SKIP_COST >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {points - SKIP_COST} pts
                  </span>
                </div>

                {/* New spins info */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400/50" />
                      New Spins Available
                    </span>
                    <span className="text-lg font-bold text-yellow-400">
                      +{DAILY_SPIN_LIMIT} spins
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogFooter className="flex gap-3">
              <AlertDialogCancel
                className="flex-1 py-2.5 rounded-full font-medium transition-all duration-300 cursor-pointer"
                style={{
                  background: "rgba(75, 85, 99, 0.3)",
                  border: "1px solid rgba(156, 163, 175, 0.3)",
                  color: "rgba(255, 255, 255, 0.8)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(75, 85, 99, 0.5)";
                  e.currentTarget.style.borderColor = "rgba(156, 163, 175, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(75, 85, 99, 0.3)";
                  e.currentTarget.style.borderColor = "rgba(156, 163, 175, 0.3)";
                }}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleSkipCooldown}
                disabled={isSkipping || points < SKIP_COST}
                className="flex-1 py-2.5 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden relative group"
                style={{
                  background: points >= SKIP_COST
                    ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
                    : "rgba(75, 85, 99, 0.5)",
                  boxShadow: points >= SKIP_COST
                    ? "0 4px 15px rgba(139, 92, 246, 0.3)"
                    : "none"
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  {isSkipping ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Skip for {SKIP_COST} pts
                    </>
                  )}
                </span>
                {points >= SKIP_COST && (
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}