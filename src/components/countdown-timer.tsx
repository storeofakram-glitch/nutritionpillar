
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  className?: string;
}

export default function CountdownTimer({ endDate, className }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  if (!isClient || +new Date(endDate) < +new Date()) {
    return null;
  }
  
  return (
    <div className={cn("flex items-center gap-2 text-center", className)}>
        <Timer className="h-5 w-5 text-yellow-500" />
        <div className="flex items-center gap-1.5">
            {timerComponents.map((part, index) => (
                <div key={part.label} className="flex items-center gap-1.5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
                            {String(part.value).padStart(2, '0')}
                        </span>
                    </div>
                    {index < timerComponents.length - 1 && <span className="text-yellow-500 font-bold">:</span>}
                </div>
            ))}
        </div>
    </div>
  );
}
