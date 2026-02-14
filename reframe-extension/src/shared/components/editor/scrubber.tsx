"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrubberProps {
    progress: number;
    onSeek: (percent: number) => void;
}

export function Scrubber({ progress, onSeek }: ScrubberProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const getPercentFromEvent = useCallback(
        (e: React.MouseEvent | MouseEvent) => {
            const track = trackRef.current;
            if (!track) return 0;
            const rect = track.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            return (x / rect.width) * 100;
        },
        []
    );

    const handlePointerDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            const percent = getPercentFromEvent(e);
            onSeek(percent);

            const handleMove = (me: MouseEvent) => {
                const p = getPercentFromEvent(me);
                onSeek(p);
            };

            const handleUp = () => {
                setIsDragging(false);
                document.removeEventListener("mousemove", handleMove);
                document.removeEventListener("mouseup", handleUp);
            };

            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
        },
        [getPercentFromEvent, onSeek]
    );

    return (
        <div
            ref={trackRef}
            className="relative w-full h-5 flex items-center group cursor-pointer scrubber-container select-none"
            onMouseDown={handlePointerDown}
        >
            {/* Track background */}
            <div
                className={cn(
                    "absolute w-full h-[2px] bg-white/20 rounded-full overflow-hidden",
                    "group-hover:h-[4px] transition-all duration-300",
                    isDragging && "h-[4px]"
                )}
            >
                {/* Progress fill */}
                <div
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Thumb / playhead */}
            <div
                className={cn(
                    "absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)] transition-all duration-200",
                    "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100",
                    isDragging && "opacity-100 scale-100"
                )}
                style={{ left: `calc(${progress}% - 6px)` }}
            />
        </div>
    );
}
