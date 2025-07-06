// src/components/home/spinner-roulette.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useStore";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Sparkles, Star, Trophy, X } from "lucide-react";
import { SPINNER_SECTIONS } from '@/constants';
import { getWeightedRandomSection } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SPIN_COST = 100;

export function SpinnerRoulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [spinResult, setSpinResult] = useState<{ won: boolean; amount: number }>({ won: false, amount: 0 });
  const { walletAddress, points, setPoints } = useUserStore();

  const handleSpin = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (points < SPIN_COST) {
      toast.error(`You need ${SPIN_COST} points to spin!`);
      return;
    }

    if (isSpinning) return;

    // Start spinning immediately
    setIsSpinning(true);

    // Determine the result immediately
    const { section: selectedSection, index: selectedIndex } = getWeightedRandomSection();
    const prizeValue = selectedSection.value;

    // Calculate rotation to land on the selected section
    const sectionAngle = 360 / SPINNER_SECTIONS.length;

    // Get the current position of the wheel (normalized to 0-360)
    const currentRotation = rotation % 360;

    // Calculate where the selected section currently is
    const selectedSectionCurrentAngle = selectedIndex * sectionAngle + (sectionAngle / 2);

    // Calculate how much we need to rotate from current position
    // We want the selected section to end up at the top (0 degrees)
    let rotationNeeded = -selectedSectionCurrentAngle - currentRotation;

    // Ensure we always spin forward by adding 360 if needed
    if (rotationNeeded > 0) {
      rotationNeeded -= 360;
    }

    // Add multiple full rotations for effect
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 spins
    const totalRotation = rotation + rotationNeeded + (spins * 360);

    // Add a small random offset for realism (-5 to +5 degrees)
    const randomOffset = (Math.random() - 0.5) * 10;
    const finalRotation = totalRotation + randomOffset;

    // Start the wheel spinning immediately
    setRotation(finalRotation);

    // Log for debugging
    // console.log(`Current rotation: ${currentRotation}, Target section: ${selectedIndex} (${prizeValue} points), Final rotation: ${finalRotation}`);

    // Handle points deduction in the background
    const processTransaction = async () => {
      try {
        // Call the roulette API to process the spin
        const response = await fetch('/api/games/roulette/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: walletAddress,
            prizeValue: prizeValue,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Update points in the store
          setPoints(data.userPoints);

          // Wait for spin animation to complete
          setTimeout(() => {
            setIsSpinning(false);

            // Normalize the rotation to prevent huge rotation values
            // This keeps the rotation value between 0-360 degrees
            const normalizedRotation = finalRotation % 360;
            setRotation(normalizedRotation);

            if (prizeValue > 0) {
              if (prizeValue >= 100) {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }
            }

            // Set the result and show dialog
            setSpinResult({ won: prizeValue > 0, amount: prizeValue });
            setShowResultDialog(true);
          }, 4000);
        } else {
          // If API call fails, stop spinning
          setIsSpinning(false);
          toast.error(data.error || "Failed to process spin. Please try again.");
        }
      } catch {
        // If something goes wrong, stop spinning
        setIsSpinning(false);
        toast.error("Failed to process spin. Please try again.");
      }
    };

    // Process transaction in background while wheel spins
    processTransaction();
  };

  const sectionAngle = 360 / SPINNER_SECTIONS.length;

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 30, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              initial={{
                x: Math.random() * 400,
                y: Math.random() * 400,
              }}
              animate={{
                x: Math.random() * 400,
                y: Math.random() * 400,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with animated stars */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-5 h-5 text-yellow-400" />
            </motion.div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fortune Wheel
            </h2>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-5 h-5 text-yellow-400" />
            </motion.div>
          </div>

          {/* Spinner Container */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              {/* Glow effect behind wheel */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />
              </div>

              {/* Enhanced Pointer - Fixed at top */}
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
                        background: "radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%)"
                      }}
                    />
                  </div>

                  {/* Main pointer */}
                  <div className="relative">
                    <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-2xl">
                      <circle
                        cx="30"
                        cy="30"
                        r="28"
                        fill="none"
                        stroke="url(#pointerGradient)"
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                      <path
                        d="M30 10 L40 35 L30 32 L20 35 Z"
                        fill="url(#pointerGradient)"
                        stroke="#1A1A2E"
                        strokeWidth="1"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="4"
                        fill="#FFD700"
                        stroke="#1A1A2E"
                        strokeWidth="1"
                      />
                      <defs>
                        <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFD700" />
                          <stop offset="100%" stopColor="#FFA500" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* Wheel */}
              <div className="relative aspect-square w-[280px]">
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: rotation }}
                  transition={{
                    duration: 4,
                    ease: [0.17, 0.55, 0.55, 1],
                  }}
                >
                  <svg viewBox="0 0 300 300" className="w-full h-full filter drop-shadow-2xl">
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
                            strokeWidth="3"
                            className="hover:brightness-110 transition-all duration-300"
                          />
                          <path
                            d={pathData}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="1"
                          />
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize="24"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                            style={{
                              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                              filter: "drop-shadow(0 0 3px rgba(255,255,255,0.5))"
                            }}
                          >
                            {section.value}
                          </text>
                        </g>
                      );
                    })}

                    {/* Center circle with gradient */}
                    <circle
                      cx="150"
                      cy="150"
                      r="40"
                      fill="url(#centerGradient)"
                      stroke="#1A1A2E"
                      strokeWidth="3"
                    />

                    {/* Center decoration */}
                    <circle
                      cx="150"
                      cy="150"
                      r="35"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1"
                    />

                    {/* Center star - properly centered */}
                    <g transform="translate(150, 150)">
                      <path
                        d="M0,-15 L5,-5 L15,-5 L7,3 L10,13 L0,7 L-10,13 L-7,3 L-15,-5 L-5,-5 Z"
                        fill="#FFD700"
                        opacity="0.8"
                      />
                    </g>

                    <defs>
                      <radialGradient id="centerGradient">
                        <stop offset="0%" stopColor="#2A2A4A" />
                        <stop offset="100%" stopColor="#1A1A2E" />
                      </radialGradient>
                    </defs>
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Spin Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full max-w-xs"
            >
              <Button
                onClick={handleSpin}
                disabled={!walletAddress || isSpinning || points < SPIN_COST}
                className="w-full py-6 text-lg font-bold rounded-full transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: isSpinning
                    ? "rgba(26, 26, 46, 0.9)"
                    : walletAddress && points >= SPIN_COST
                      ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                      : "rgba(75, 85, 99, 0.5)",
                  boxShadow: walletAddress && points >= SPIN_COST && !isSpinning
                    ? "0 8px 30px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                    : "none",
                  color: walletAddress && points >= SPIN_COST && !isSpinning ? "#1A1A2E" : "#FFFFFF"
                }}
              >
                {/* Button shine effect */}
                {walletAddress && points >= SPIN_COST && !isSpinning && (
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12" />
                  </motion.div>
                )}

                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSpinning ? (
                    <>
                      <motion.svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                      </motion.svg>
                      <span>Spinning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Spin for {SPIN_COST} pts</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </span>
              </Button>
            </motion.div>

            {/* Insufficient funds message */}
            {walletAddress && points < SPIN_COST && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-red-400 flex items-center justify-center gap-2"
              >
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Need {SPIN_COST - points} more points to spin
              </motion.p>
            )}

            {/* Not connected message */}
            {!walletAddress && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-gray-400 flex items-center justify-center gap-2"
              >
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                Connect wallet to play
              </motion.p>
            )}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      {/* Result Dialog */}
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent
          className="max-w-md border-0 overflow-hidden"
          style={{
            background: "rgba(26, 26, 46, 0.98)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.7), 0 0 50px rgba(0, 212, 255, 0.3)"
          }}
          aria-describedby="spinner-result-description"
        >
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: spinResult.won
                  ? [
                    "radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)"
                  ]
                  : [
                    "radial-gradient(circle at 20% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 20%, rgba(255, 20, 147, 0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%)"
                  ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">
                <AnimatePresence mode="wait">
                  {spinResult.won ? (
                    <motion.div
                      key="won"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="relative">
                        <Trophy className="w-20 h-20 text-yellow-400" />
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 0, 0.7]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Trophy className="w-20 h-20 text-yellow-400 blur-lg" />
                        </motion.div>
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Congratulations!
                      </h2>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lost"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="relative">
                        <X className="w-20 h-20 text-red-400" />
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <X className="w-20 h-20 text-red-400 blur-lg" />
                        </motion.div>
                      </div>
                      <h2 className="text-3xl font-bold text-red-400">
                        Better Luck Next Time!
                      </h2>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AlertDialogTitle>
            </AlertDialogHeader>

            {/* Move the description content outside of AlertDialogDescription */}
            <motion.div
              id="spinner-result-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 text-center mt-4"
            >
              <div className="text-5xl font-bold">
                {spinResult.won ? (
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    +{spinResult.amount} Points!
                  </span>
                ) : (
                  <span className="text-gray-400">0 Points</span>
                )}
              </div>

              {spinResult.won && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex justify-center gap-2"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    >
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <p className="text-gray-400 text-sm">
                {spinResult.won
                  ? "Your winnings have been added to your balance!"
                  : "Try spinning again for another chance to win!"}
              </p>
            </motion.div>

            <AlertDialogFooter className="mt-6">
              <Button
                onClick={() => setShowResultDialog(false)}
                className="w-full py-3 rounded-full font-semibold text-lg"
                style={{
                  background: spinResult.won
                    ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                    : "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                  color: spinResult.won ? "#1A1A2E" : "#FFFFFF"
                }}
              >
                {spinResult.won ? "Awesome!" : "Try Again"}
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}