
"use client";

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface DynamicCounterProps {
  endValue: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export default function DynamicCounter({ endValue, duration = 2000, className, suffix }: DynamicCounterProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const currentCount = Math.min(Math.floor((progress / duration) * endValue), endValue);
        setCount(currentCount);

        if (progress < duration) {
          requestAnimationFrame(animateCount);
        } else {
            setCount(endValue);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [inView, endValue, duration]);

  return <span ref={ref} className={className}>{count.toLocaleString()}{suffix}</span>;
}
