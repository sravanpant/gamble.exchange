'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WoodenGateProps {
  onEnter: () => void;
}

export function WoodenGate({ onEnter }: WoodenGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsOpen(true);
    
    // Start exit animation
    setTimeout(() => {
      setIsExiting(true);
    }, 800);
    
    // Notify parent after animation completes
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
          style={{ backgroundColor: '#0F0F1E' }}
        >
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4FF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Left Door */}
          <motion.div
            animate={{ x: isOpen ? '-100%' : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute left-0 top-0 w-1/2 h-full overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2C1810 0%, #1A0F08 100%)',
              boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Wood Texture */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)`,
              }}
            />
            
            {/* Metal hinges */}
            <div className="absolute top-10 left-4 w-12 h-20 hidden md:block">
              <div 
                className="w-full h-full rounded"
                style={{
                  background: 'linear-gradient(180deg, #8B7355 0%, #654321 50%, #8B7355 100%)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            <div className="absolute bottom-10 left-4 w-12 h-20 hidden md:block">
              <div 
                className="w-full h-full rounded"
                style={{
                  background: 'linear-gradient(180deg, #8B7355 0%, #654321 50%, #8B7355 100%)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            
            {/* Door Handle */}
            <div 
              className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-32 rounded-full hidden md:block"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </motion.div>

          {/* Right Door */}
          <motion.div
            animate={{ x: isOpen ? '100%' : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute right-0 top-0 w-1/2 h-full overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A0F08 0%, #2C1810 100%)',
              boxShadow: 'inset 20px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Wood Texture */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)`,
              }}
            />
            
            {/* Metal hinges */}
            <div className="absolute top-10 right-4 w-12 h-20 hidden md:block">
              <div 
                className="w-full h-full rounded"
                style={{
                  background: 'linear-gradient(180deg, #8B7355 0%, #654321 50%, #8B7355 100%)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            <div className="absolute bottom-10 right-4 w-12 h-20 hidden md:block">
              <div 
                className="w-full h-full rounded"
                style={{
                  background: 'linear-gradient(180deg, #8B7355 0%, #654321 50%, #8B7355 100%)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            
            {/* Door Handle */}
            <div 
              className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-32 rounded-full hidden md:block"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 text-center px-4"
          >
            {/* Casino Logo */}
            <motion.div
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-24 h-24 mx-auto mb-6"
            >
              <div 
                className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
                }}
              >
                CR
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 casino-gradient-text"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 20px rgba(0,212,255,0.5))',
                  'drop-shadow(0 0 40px rgba(0,212,255,0.8))',
                  'drop-shadow(0 0 20px rgba(0,212,255,0.5))',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              CASINO ROYALE
            </motion.h1>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-8" style={{ color: '#A0A0B8' }}>
              Where Fortune Meets Luxury
            </p>
            
            <motion.button
              onClick={handleEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative casino-button text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 overflow-hidden group"
              style={{
                boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
              }}
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 -left-full w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
                animate={{
                  x: ['0%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <span className="relative z-10">ENTER THE CASINO</span>
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <p className="text-xs sm:text-sm" style={{ color: '#666' }}>
                Must be 18+ to enter. Please gamble responsibly.
              </p>
            </motion.div>
          </motion.div>

          {/* Floating chip animations */}
          <motion.div
            className="absolute top-20 left-10 w-12 h-12 hidden md:block"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div 
              className="w-full h-full rounded-full border-4 border-dashed border-yellow-400"
              style={{ borderStyle: 'ridge' }}
            />
          </motion.div>
          
          <motion.div
            className="absolute bottom-20 right-10 w-16 h-16 hidden md:block"
            animate={{
              y: [0, 20, 0],
              rotate: [360, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div 
              className="w-full h-full rounded-full border-4 border-dashed border-red-500"
              style={{ borderStyle: 'ridge' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}