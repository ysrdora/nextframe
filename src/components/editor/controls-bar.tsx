"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
    Play,
    Pause,
    ChevronLeft,
    ChevronRight,
    Camera,
    Columns2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ControlsBarProps {
    isPlaying: boolean;
    timecode: string;
    onTogglePlay: () => void;
    onStepFrame: (direction: -1 | 1) => void;
    onCapture: () => void;
    onBatchCapture: () => void;
    isBatchLoading: boolean;
}

export function ControlsBar({
    isPlaying,
    timecode,
    onTogglePlay,
    onStepFrame,
    onCapture,
    onBatchCapture,
    isBatchLoading,
}: ControlsBarProps) {
    const scrubIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scrubTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startScrub = useCallback(
        (direction: -1 | 1) => {
            onStepFrame(direction);
            scrubTimeoutRef.current = setTimeout(() => {
                scrubIntervalRef.current = setInterval(
                    () => onStepFrame(direction),
                    80
                );
            }, 400);
        },
        [onStepFrame]
    );

    const stopScrub = useCallback(() => {
        if (scrubTimeoutRef.current) clearTimeout(scrubTimeoutRef.current);
        if (scrubIntervalRef.current) clearInterval(scrubIntervalRef.current);
    }, []);

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={onTogglePlay}
                            className="text-zinc-300 hover:text-white transition active:scale-95 p-1 no-select"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" fill="currentColor" />
                            ) : (
                                <Play className="w-5 h-5" fill="currentColor" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>{isPlaying ? "Pause" : "Play"} (Space)</p>
                    </TooltipContent>
                </Tooltip>

                {/* Frame Step */}
                <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onMouseDown={(e) => {
                                    if (e.button === 0) startScrub(-1);
                                }}
                                onMouseUp={stopScrub}
                                onMouseLeave={stopScrub}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    startScrub(-1);
                                }}
                                onTouchEnd={stopScrub}
                                onTouchCancel={stopScrub}
                                className={cn(
                                    "text-zinc-500 hover:text-white transition active:scale-95",
                                    "hover:bg-white/10 p-1.5 rounded-lg no-select"
                                )}
                            >
                                <ChevronLeft className="w-[18px] h-[18px]" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Previous Frame (←)</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onMouseDown={(e) => {
                                    if (e.button === 0) startScrub(1);
                                }}
                                onMouseUp={stopScrub}
                                onMouseLeave={stopScrub}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    startScrub(1);
                                }}
                                onTouchEnd={stopScrub}
                                onTouchCancel={stopScrub}
                                className={cn(
                                    "text-zinc-500 hover:text-white transition active:scale-95",
                                    "hover:bg-white/10 p-1.5 rounded-lg no-select"
                                )}
                            >
                                <ChevronRight className="w-[18px] h-[18px]" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Next Frame (→)</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Desktop Timecode */}
                <div className="hidden md:block pl-2">
                    <span className="font-mono text-[11px] text-zinc-400 font-medium tracking-widest tabular-nums select-none">
                        {timecode}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Batch First/Last */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={onBatchCapture}
                            disabled={isBatchLoading}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                                "text-zinc-500 hover:text-white hover:bg-white/10",
                                "transition group no-select",
                                isBatchLoading && "pointer-events-none"
                            )}
                        >
                            {isBatchLoading ? (
                                <span className="animate-pulse text-[11px] font-medium tracking-wide">
                                    Extracting...
                                </span>
                            ) : (
                                <>
                                    <Columns2 className="w-4 h-4" />
                                    <span className="hidden md:inline text-[11px] font-medium tracking-wide">
                                        First / Last
                                    </span>
                                </>
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Extract First & Last Frame</p>
                    </TooltipContent>
                </Tooltip>

                {/* Snapshot */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative ml-2">
                            <button
                                onClick={onCapture}
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg",
                                    "bg-white/10 hover:bg-white/20 text-white",
                                    "border border-white/5 shadow-sm transition active:scale-95",
                                    "group no-select relative z-10"
                                )}
                            >
                                <Camera className="w-4 h-4 group-hover:scale-105 transition-transform" />
                            </button>

                            {/* Stroke attention pulse */}
                            <svg
                                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                                viewBox="0 0 32 32"
                                fill="none"
                            >
                                <motion.rect
                                    x="0.5"
                                    y="0.5"
                                    width="31"
                                    height="31"
                                    rx="7.5"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: [0, 0.8, 0.8, 0],
                                    }}
                                    transition={{
                                        duration: 1.6,
                                        delay: 1.5,
                                        times: [0, 0.15, 0.7, 1],
                                        ease: "easeInOut",
                                    }}
                                />
                            </svg>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Snapshot</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
