"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WoodenGateProps {
  onEnter: () => void;
}

export function WoodenGate({ onEnter }: WoodenGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    // Start door opening animation
    setIsOpen(true);

    // Start exit animation after doors open
    setTimeout(() => {
      setIsExiting(true);
    }, 800);

    // Notify parent after all animations complete
    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {/* Animated Background that appears when door opens */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Radial gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 20% 80%, #FFD700 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, #9D00FF 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, #00D4FF 0%, transparent 70%)
                `,
                filter: 'blur(100px)',
              }}
            />
            
            {/* Animated particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#FFD700', '#00D4FF', '#9D00FF', '#FF1493'][i % 4],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Left Door */}
          <motion.div
            animate={{ x: isOpen ? "-100%" : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute left-0 top-0 w-1/2 h-full overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #1A0F08 0%, #2C1810 20%, #3D2817 80%, #1A0F08 100%)",
              boxShadow:
                "inset -30px 0 60px rgba(0,0,0,0.8), inset -5px 0 20px rgba(255,215,0,0.1)",
            }}
          >
            {/* Royal Wood Texture */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, 
                    transparent, 
                    transparent 2px, 
                    rgba(139,69,19,0.3) 2px, 
                    rgba(139,69,19,0.3) 4px,
                    transparent 4px,
                    transparent 6px,
                    rgba(160,82,45,0.2) 6px,
                    rgba(160,82,45,0.2) 8px
                  )
                `,
              }}
            />

            {/* Gold Ornamental Border */}
            <div className="absolute inset-4 border-2 border-yellow-600/30 rounded-sm" />
            <div className="absolute inset-6 border border-yellow-700/20 rounded-sm" />
          </motion.div>

          {/* Right Door */}
          <motion.div
            animate={{ x: isOpen ? "100%" : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute right-0 top-0 w-1/2 h-full overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #1A0F08 0%, #2C1810 20%, #3D2817 80%, #1A0F08 100%)",
              boxShadow:
                "inset 30px 0 60px rgba(0,0,0,0.8), inset 5px 0 20px rgba(255,215,0,0.1)",
            }}
          >
            {/* Royal Wood Texture */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, 
                    transparent, 
                    transparent 2px, 
                    rgba(139,69,19,0.3) 2px, 
                    rgba(139,69,19,0.3) 4px,
                    transparent 4px,
                    transparent 6px,
                    rgba(160,82,45,0.2) 6px,
                    rgba(160,82,45,0.2) 8px
                  )
                `,
              }}
            />

            {/* Gold Ornamental Border */}
            <div className="absolute inset-4 border-2 border-yellow-600/30 rounded-sm" />
            <div className="absolute inset-6 border border-yellow-700/20 rounded-sm" />
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 text-center px-4 flex flex-col items-center"
          >
            {/* Crown Logo */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-32 h-24 mb-6"
            >
              <svg viewBox="0 0 128 96" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="crownGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 70 L30 30 L35 50 L50 20 L64 40 L78 20 L93 50 L98 30 L108 70 L90 85 L38 85 Z"
                  fill="url(#crownGradient)"
                  stroke="#8B6914"
                  strokeWidth="2"
                />
                <circle cx="35" cy="50" r="4" fill="#FF1493" />
                <circle cx="64" cy="45" r="6" fill="#00D4FF" />
                <circle cx="93" cy="50" r="4" fill="#9D00FF" />
              </svg>
            </motion.div>

            <motion.button
              onClick={handleEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-12 py-4 overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, #B8860B 0%, #FFD700 50%, #B8860B 100%)",
                boxShadow:
                  "0 10px 40px rgba(255,215,0,0.4), inset 0 -2px 10px rgba(0,0,0,0.3)",
                borderRadius: "8px",
                border: "2px solid #8B6914",
              }}
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 -left-full w-full h-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                }}
                animate={{
                  x: ["0%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative z-10 text-black font-bold text-lg tracking-wider">
                ENTER THE CASINO
              </span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <p className="text-xs sm:text-sm" style={{ color: "#666" }}>
                Must be 18+ to enter. Please gamble responsibly.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}