
"use client";

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface DynamicCounterProps {
  endValue: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export default function DynamicCounter({ endValue, duration = 3000, className, suffix }: DynamicCounterProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    // When the component comes into view and the endValue is greater than 0, start the animation.
    if (inView && endValue > 0) {
      setCount(0); // Reset count to 0 to start animation from the beginning
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        
        // Calculate what fraction of the duration has passed
        const progressFraction = Math.min(progress / duration, 1);
        
        // Calculate the current count based on that fraction
        const currentCount = Math.floor(progressFraction * endValue);
        
        setCount(currentCount);

        if (progress < duration) {
          requestAnimationFrame(animateCount);
        } else {
            // Ensure it ends exactly on the endValue
            setCount(endValue);
        }
      };
      requestAnimationFrame(animateCount);
    } else if (!inView || endValue === 0) {
      // If not in view or endValue is 0, just set the count to the endValue (which would be 0)
      setCount(endValue);
    }
  }, [inView, endValue, duration]);

  return <span ref={ref} className={className}>{count.toLocaleString()}{suffix}</span>;
}
