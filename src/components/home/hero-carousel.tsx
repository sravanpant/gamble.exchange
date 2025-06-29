"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Trophy, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    title: "Welcome Bonus",
    subtitle: "Get 200% up to $1000",
    description: "Join now and triple your first deposit",
    image: "/banners/welcome-bonus.jpg",
    cta: "Claim Now",
    link: "/promotions/welcome",
    gradient: "from-[#00D4FF] to-[#9D00FF]",
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 2,
    title: "Weekly Cashback",
    subtitle: "Up to 20% Returns",
    description: "Get cashback on your losses every week",
    image: "/banners/cashback.jpg",
    cta: "Learn More",
    link: "/promotions/cashback",
    gradient: "from-[#9D00FF] to-[#FF1493]",
    icon: <Trophy className="w-8 h-8" />,
  },
  {
    id: 3,
    title: "VIP Tournament",
    subtitle: "$50,000 Prize Pool",
    description: "Compete for the ultimate prize",
    image: "/banners/tournament.jpg",
    cta: "Join Tournament",
    link: "/tournaments",
    gradient: "from-[#FF1493] to-[#00D4FF]",
    icon: <Play className="w-8 h-8" />,
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      className="relative w-full h-[500px] overflow-hidden"
      style={{ backgroundColor: "#0F0F1E" }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,212,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(157,0,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(255,20,147,0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="relative z-20 h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                      >
                        <div
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
                          style={{
                            background: `linear-gradient(to right, ${
                              slide.gradient.split(" ")[1]
                            }, ${slide.gradient.split(" ")[3]})`,
                          }}
                        >
                          {slide.icon}
                          Limited Time Offer
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold">
                          <span
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${
                                slide.gradient.split(" ")[1]
                              }, ${slide.gradient.split(" ")[3]})`,
                            }}
                          >
                            {slide.title}
                          </span>
                        </h1>

                        <h2
                          className="text-2xl lg:text-3xl"
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          {slide.subtitle}
                        </h2>

                        <p
                          className="text-lg"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          {slide.description}
                        </p>

                        <div className="flex gap-4">
                          <Link href={slide.link}>
                            <button className="casino-button flex items-center gap-2">
                              <Play className="w-5 h-5" />
                              {slide.cta}
                            </button>
                          </Link>

                          <Link href="/games">
                            <button className="casino-button-secondary">
                              Explore Games
                            </button>
                          </Link>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="hidden lg:block relative"
                      >
                        <div
                          className="absolute inset-0 blur-3xl opacity-30"
                          style={{
                            background: `linear-gradient(to right, ${
                              slide.gradient.split(" ")[1]
                            }, ${slide.gradient.split(" ")[3]})`,
                          }}
                        />
                        <div className="relative rounded-2xl overflow-hidden casino-glow">
                          <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                            <div className="text-6xl font-bold casino-gradient-text">
                              {slide.title}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full casino-card casino-glow-hover"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full casino-card casino-glow-hover"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <Button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? "w-8 h-2 bg-gradient-to-r from-[#00D4FF] to-[#9D00FF]"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            } rounded-full`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-10 w-4 h-4 rounded-full bg-[#00D4FF] opacity-20 blur-sm"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-10 w-6 h-6 rounded-full bg-[#FF1493] opacity-20 blur-sm"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-40 right-20 w-3 h-3 rounded-full bg-[#9D00FF] opacity-20 blur-sm"
        />
      </div>
    </div>
  );
}
