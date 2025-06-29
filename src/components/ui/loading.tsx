"use client";

import { motion } from "framer-motion";

export function Loading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#0F0F1E" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(45deg, #00D4FF, #9D00FF, #FF1493)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="absolute inset-2 rounded-full"
            style={{ backgroundColor: "#0F0F1E" }}
          />
        </div>
        <h2 className="text-xl font-bold casino-gradient-text">
          Loading Casino...
        </h2>
      </motion.div>
    </div>
  );
}
