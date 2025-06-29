"use client";

import Link from "next/link";
import {
  Twitter,
  Send,
  MessageCircle,
  Github,
  Shield,
  Award,
  Zap,
  Globe,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-20 border-t border-[#00D4FF]/20"
      style={{ backgroundColor: "#0F0F1E" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold casino-gradient-text mb-4">
              Gamble.exchange
            </h3>
            <p className="text-sm mb-4" style={{ color: "#A0A0B8" }}>
              Experience the thrill of crypto gaming with provably fair games
              and instant payouts.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-[#252547] hover:bg-[#00D4FF]/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-[#252547] hover:bg-[#00D4FF]/20 transition-colors"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-[#252547] hover:bg-[#00D4FF]/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-[#252547] hover:bg-[#00D4FF]/20 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/games"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  All Games
                </Link>
              </li>
              <li>
                <Link
                  href="/promotions"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Promotions
                </Link>
              </li>
              <li>
                <Link
                  href="/vip"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  VIP Club
                </Link>
              </li>
              <li>
                <Link
                  href="/tournaments"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Tournaments
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/fairness"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Provably Fair
                </Link>
              </li>
              <li>
                <Link
                  href="/responsible-gaming"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-[#00D4FF] transition-colors"
                  style={{ color: "#A0A0B8" }}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Why Choose Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: "#00D4FF" }} />
                <span className="text-sm" style={{ color: "#A0A0B8" }}>
                  Secure & Licensed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: "#00D4FF" }} />
                <span className="text-sm" style={{ color: "#A0A0B8" }}>
                  Instant Payouts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: "#00D4FF" }} />
                <span className="text-sm" style={{ color: "#A0A0B8" }}>
                  VIP Rewards
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: "#00D4FF" }} />
                <span className="text-sm" style={{ color: "#A0A0B8" }}>
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-[#00D4FF]/20 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <h4 className="font-semibold mb-4">Accepted Cryptocurrencies</h4>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {[
              "Bitcoin",
              "Ethereum",
              "USDT",
              "USDC",
              "BNB",
              "Polygon",
              "Solana",
              "Avalanche",
            ].map((crypto) => (
              <div
                key={crypto}
                className="px-3 sm:px-4 py-2 rounded-lg bg-[#252547] text-xs sm:text-sm"
                style={{ color: "#A0A0B8" }}
              >
                {crypto}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#00D4FF]/20 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p
            className="text-xs sm:text-sm text-center sm:text-left"
            style={{ color: "#666" }}
          >
            © {currentYear} Casino Royale. All rights reserved.
          </p>
          <p
            className="text-xs sm:text-sm text-center sm:text-right"
            style={{ color: "#666" }}
          >
            18+ | Please gamble responsibly | BeGambleAware
          </p>
        </div>
      </div>
    </footer>
  );
}
