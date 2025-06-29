// components/BackgroundMusic.tsx
"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useCasinoStore } from "@/store/useStore";

export interface BackgroundMusicHandle {
  playMusic: () => void;
}

const BackgroundMusic = forwardRef<BackgroundMusicHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { checkRecentEntry } = useCasinoStore();

  // Automatically try to resume music if user entered recently
  useEffect(() => {
    if (checkRecentEntry() && audioRef.current) {
      const play = async () => {
        try {
          await audioRef.current?.play();
          console.log("Music resumed on mount");
        } catch (err) {
          console.warn("Autoplay failed:", err);
        }
      };
      play();
    }
  }, [checkRecentEntry]);

  useImperativeHandle(ref, () => ({
    playMusic: () => {
      audioRef.current?.play().catch((err) => {
        console.warn("Manual play failed:", err);
      });
    },
  }));

  return <audio ref={audioRef} src="/background.mp3" loop />;
});

BackgroundMusic.displayName = "BackgroundMusic";
export default BackgroundMusic;
