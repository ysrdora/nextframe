"use client";

import { cn } from "@/lib/utils";

interface ScrubberProps {
    progress: number;
    onSeek: (percent: number) => void;
}

export function Scrubber({ progress, onSeek }: ScrubberProps) {
    return (
        <div className="relative w-full h-4 flex items-center group cursor-pointer scrubber-container">
            <div
                className={cn(
                    "absolute w-full h-[2px] bg-white/20 rounded-full overflow-hidden",
                    "group-hover:h-[4px] transition-all duration-300"
                )}
            >
                <div
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <input
                type="range"
                min="0"
                max="100"
                step="0.01"
                value={progress}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="relative w-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            />
        </div>
    );
}
