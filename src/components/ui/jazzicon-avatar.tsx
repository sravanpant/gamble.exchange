// src/components/ui/jazzicon-avatar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import jazzicon from "@metamask/jazzicon";

interface JazziconAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

export function JazziconAvatar({ address, size = 28, className = "" }: JazziconAvatarProps) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateAvatar = () => {
      if (!address || !avatarRef.current) return;

      try {
        // Clear any existing content
        avatarRef.current.innerHTML = '';

        // Generate the icon
        const seed = parseInt(address.slice(2, 10), 16);
        const icon = jazzicon(size, seed);

        // Append to DOM
        avatarRef.current.appendChild(icon);
        setIsLoading(false);
      } catch (error) {
        console.error("Error generating Jazzicon:", error);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(generateAvatar, 0);

    return () => clearTimeout(timer);
  }, [address, size]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 rounded-full bg-gray-700 animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <div
        ref={avatarRef}
        className="rounded-full overflow-hidden ring-2 ring-cyan-500/30"
        style={{
          width: size,
          height: size,
          boxShadow: "0 0 10px rgba(0, 212, 255, 0.3)",
          visibility: isLoading ? 'hidden' : 'visible'
        }}
      />
    </div>
  );
}