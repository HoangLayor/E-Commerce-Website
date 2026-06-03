"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calcTimeLeft() {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calcTimeLeft());
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-5 w-5" />
      <div className="flex items-center gap-1 font-mono font-bold text-lg">
        <span className="bg-white/20 px-2 py-1 rounded">{pad(timeLeft.hours)}</span>
        <span>:</span>
        <span className="bg-white/20 px-2 py-1 rounded">{pad(timeLeft.minutes)}</span>
        <span>:</span>
        <span className="bg-white/20 px-2 py-1 rounded">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}
