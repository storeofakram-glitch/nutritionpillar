
"use client"

import { cn } from "@/lib/utils";

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
        >
            <div
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
