"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Trophy,
  Headphones,
  CreditCard,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: "Provably Fair",
    description: "All games use cryptographic proof to ensure fairness",
    color: "#00D4FF",
  },
  {
    icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: "Instant Payouts",
    description: "Withdraw your winnings instantly with no delays",
    color: "#FFD700",
  },
  {
    icon: <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: "VIP Program",
    description: "Exclusive rewards and benefits for loyal players",
    color: "#9D00FF",
  },
  {
    icon: <Headphones className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: "24/7 Support",
    description: "Professional support team available round the clock",
    color: "#FF1493",
  },
  {
    icon: <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: "Crypto Payments",
    description: "Support for all major cryptocurrencies",
    color: "#00FF88",
  },
  {
    icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: "Global Access",
    description: "Play from anywhere in the world",
    color: "#00D4FF",
  },
];

export function FeaturesSection() {
  return (
    <div>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
          Why Choose Gamble.exchange?
        </h2>
        <p className="text-base sm:text-lg px-4" style={{ color: "#A0A0B8" }}>
          Experience the future of online gaming
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="casino-card p-4 sm:p-6 h-full transition-all duration-300 group-hover:border-[#00D4FF]/50">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base" style={{ color: "#A0A0B8" }}>
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
