
"use client"

import { cn } from "@/lib/utils";
import React from "react";

interface MarqueeProps {
    className?: string;
    reverse?: boolean;
    pauseOnHover?: boolean;
    children?: React.ReactNode;
    vertical?: boolean;
    [key: string]: any;
}

export default function Marquee({
    className,
    reverse,
    pauseOnHover = false,
    children,
    vertical = false,
    ...props
}: MarqueeProps) {
    const [isPaused, setIsPaused] = React.useState(false);

    const handlePause = (paused: boolean) => {
        setIsPaused(paused);
    };

    const marqueeStyle: React.CSSProperties = {
        animationPlayState: isPaused ? 'paused' : 'running',
    };

    return (
        <div
            {...props}
            className={cn(
                "group flex overflow-hidden p-2 [--duration:20s] [--gap:1rem] [gap:var(--gap)]",
                {
                    "flex-row": !vertical,
                    "flex-col": vertical,
                },
                className
            )}
            onMouseDown={() => handlePause(true)}
            onMouseUp={() => handlePause(false)}
            onMouseLeave={() => handlePause(false)} // Resume when mouse leaves
            onTouchStart={() => handlePause(true)}
            onTouchEnd={() => handlePause(false)}
        >
            <div
                style={marqueeStyle}
                className={cn("flex min-w-full shrink-0 [gap:var(--gap)] animate-marquee items-center justify-around", {
                    "group-hover:[animation-play-state:paused]": pauseOnHover,
                    "[animation-direction:reverse]": reverse,
                    "flex-row": !vertical,
                    "flex-col": vertical,
                })}
            >
                {children}
            </div>
            <div
                style={marqueeStyle}
                className={cn("flex min-w-full shrink-0 [gap:var(--gap)] animate-marquee items-center justify-around", {
                    "group-hover:[animation-play-state:paused]": pauseOnHover,
                    "[animation-direction:reverse]": reverse,
                    "flex-row": !vertical,
                    "flex-col": vertical,
                })}
                aria-hidden="true"
            >
                {children}
            </div>
        </div>
    );
}
