'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Trophy, Zap } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

export function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([
    {
      label: 'Total Wagered',
      value: '0',
      prefix: '$',
      suffix: 'M',
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: '#00D4FF',
    },
    {
      label: 'Active Players',
      value: '0',
      suffix: 'K',
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: '#9D00FF',
    },
    {
      label: 'Biggest Win',
      value: '0',
      prefix: '$',
      suffix: 'K',
      icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: '#FFD700',
    },
    {
      label: 'Games Played',
      value: '0',
      suffix: 'M',
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: '#FF1493',
    },
  ]);

  useEffect(() => {
    // Animate numbers on mount
    const targetValues = [125.8, 45.2, 892.5, 12.4];
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats(prev => prev.map((stat, index) => ({
        ...stat,
        value: (targetValues[index] * progress).toFixed(1),
      })));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="casino-card p-4 sm:p-6">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
                  color: stat.color 
                }}
              >
                {stat.icon}
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">
                {stat.prefix}{stat.value}{stat.suffix}
              </div>
              <div className="text-xs sm:text-sm" style={{ color: '#A0A0B8' }}>
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}