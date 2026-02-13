"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoPlayer } from "@/hooks/use-video-player";
import { useFrameCapture } from "@/hooks/use-frame-capture";
import { Scrubber } from "./scrubber";
import { ControlsBar } from "./controls-bar";
import { GalleryPanel, type GalleryFrame } from "./gallery-panel";
import { MobileTimecode } from "./mobile-timecode";
import { cn } from "@/lib/utils";

interface VideoEditorProps {
    videoFile: File;
}

export function VideoEditor({ videoFile }: VideoEditorProps) {
    const {
        videoRef,
        isPlaying,
        progress,
        timecode,
        togglePlay,
        seek,
        stepFrame,
    } = useVideoPlayer();

    const { captureFrame, batchCapture, showFlash } = useFrameCapture(videoRef);

    const [frames, setFrames] = useState<GalleryFrame[]>([]);
    const [isBatchLoading, setIsBatchLoading] = useState(false);
    const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
    const [hasExpandedOnce, setHasExpandedOnce] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const expansionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const videoUrlRef = useRef<string>("");

    // Load video when file changes
    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            videoUrlRef.current = url;
            const video = videoRef.current;
            if (video) {
                video.src = url;
                video.currentTime = 0;
                video.load();
            }

            // Reveal controls after a delay
            const timer = setTimeout(() => setControlsVisible(true), 500);

            return () => {
                clearTimeout(timer);
                URL.revokeObjectURL(url);
            };
        }
    }, [videoFile, videoRef]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                togglePlay();
            }
            if (e.code === "ArrowRight") stepFrame(1);
            if (e.code === "ArrowLeft") stepFrame(-1);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [togglePlay, stepFrame]);

    const expandGallery = useCallback(
        (duration: number = 2000) => {
            setIsGalleryExpanded(true);
            if (expansionTimerRef.current) clearTimeout(expansionTimerRef.current);
            expansionTimerRef.current = setTimeout(() => {
                setIsGalleryExpanded(false);
            }, duration);
        },
        []
    );

    const addFrameToGallery = useCallback(
        (frame: { dataUrl: string; filename: string }) => {
            const newFrame: GalleryFrame = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                dataUrl: frame.dataUrl,
                filename: frame.filename,
            };
            setFrames((prev) => [newFrame, ...prev]);

            // Only auto-expand on first capture
            if (!hasExpandedOnce) {
                expandGallery();
                setHasExpandedOnce(true);
            }
        },
        [hasExpandedOnce, expandGallery]
    );

    const handleCapture = useCallback(() => {
        const frame = captureFrame();
        if (frame) {
            addFrameToGallery(frame);
        }
    }, [captureFrame, addFrameToGallery]);

    const handleBatchCapture = useCallback(async () => {
        setIsBatchLoading(true);
        const capturedFrames = await batchCapture();
        capturedFrames.forEach((frame) => addFrameToGallery(frame));
        setIsBatchLoading(false);
    }, [batchCapture, addFrameToGallery]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Video Stage */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800/50 shadow-2xl flex-1 min-h-0">
                <div className="absolute inset-0 flex items-center justify-center">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={togglePlay}
                        playsInline
                    />
                </div>

                {/* Flash overlay */}
                <AnimatePresence>
                    {showFlash && (
                        <motion.div
                            className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay z-30"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        />
                    )}
                </AnimatePresence>

                {/* Mobile Timecode */}
                {controlsVisible && <MobileTimecode timecode={timecode} />}

                {/* Floating Controls */}
                <motion.div
                    className={cn(
                        "absolute bottom-6 left-1/2 -translate-x-1/2",
                        "w-auto min-w-[320px] max-w-[92%] md:w-[80%] md:max-w-4xl",
                        "glass-panel rounded-xl px-4 py-3 z-40 flex flex-col gap-3 shadow-2xl"
                    )}
                    initial={{ y: 10, opacity: 0 }}
                    animate={
                        controlsVisible
                            ? { y: 0, opacity: 1 }
                            : { y: 10, opacity: 0 }
                    }
                    transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                >
                    <Scrubber progress={progress} onSeek={seek} />
                    <ControlsBar
                        isPlaying={isPlaying}
                        timecode={timecode}
                        onTogglePlay={togglePlay}
                        onStepFrame={stepFrame}
                        onCapture={handleCapture}
                        onBatchCapture={handleBatchCapture}
                        isBatchLoading={isBatchLoading}
                    />
                </motion.div>
            </div>

            {/* Gallery Panel */}
            <motion.div
                className="relative shrink-0 z-40"
                animate={{ height: isGalleryExpanded ? "11rem" : "7rem" }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
                <GalleryPanel frames={frames} isExpanded={isGalleryExpanded} />
            </motion.div>
        </div>
    );
}
