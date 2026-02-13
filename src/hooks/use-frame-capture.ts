"use client";

import { useCallback, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

interface CapturedFrame {
    dataUrl: string;
    filename: string;
    timestamp: number;
}

interface UseFrameCaptureReturn {
    captureFrame: () => CapturedFrame | null;
    batchCapture: () => Promise<CapturedFrame[]>;
    showFlash: boolean;
}

export function useFrameCapture(
    videoRef: React.RefObject<HTMLVideoElement | null>
): UseFrameCaptureReturn {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [showFlash, setShowFlash] = useState(false);

    const getCanvas = useCallback(() => {
        if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
        }
        return canvasRef.current;
    }, []);

    const triggerFlash = useCallback(() => {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 150);
    }, []);

    const extractFrame = useCallback(
        (filename: string): CapturedFrame | null => {
            const video = videoRef.current;
            if (!video || !video.videoWidth) return null;
            const canvas = getCanvas();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            ctx.drawImage(video, 0, 0);
            return {
                dataUrl: canvas.toDataURL("image/png"),
                filename,
                timestamp: video.currentTime,
            };
        },
        [videoRef, getCanvas]
    );

    const captureFrame = useCallback((): CapturedFrame | null => {
        const video = videoRef.current;
        if (!video) return null;
        triggerFlash();
        const timecode = formatTime(video.currentTime).replace(/:/g, "");
        return extractFrame(`REFRAME_${timecode}.png`);
    }, [videoRef, triggerFlash, extractFrame]);

    const seekToTime = useCallback(
        (time: number): Promise<void> => {
            return new Promise((resolve) => {
                const video = videoRef.current;
                if (!video) {
                    resolve();
                    return;
                }
                const onSeek = () => {
                    video.removeEventListener("seeked", onSeek);
                    resolve();
                };
                video.addEventListener("seeked", onSeek);
                video.currentTime = time;
            });
        },
        [videoRef]
    );

    const batchCapture = useCallback(async (): Promise<CapturedFrame[]> => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return [];

        const originalTime = video.currentTime;
        const wasPaused = video.paused;
        if (!wasPaused) video.pause();

        const frames: CapturedFrame[] = [];

        try {
            // Seek to start
            await seekToTime(0);
            const startFrame = extractFrame("REFRAME_START.png");
            if (startFrame) frames.push(startFrame);

            // Seek to end
            await seekToTime(video.duration);
            const endFrame = extractFrame("REFRAME_END.png");
            if (endFrame) frames.push(endFrame);

            // Return to original position
            await seekToTime(originalTime);
        } catch (error) {
            console.error("Batch extraction error:", error);
        }

        if (!wasPaused) video.play();
        return frames;
    }, [videoRef, seekToTime, extractFrame]);

    return {
        captureFrame,
        batchCapture,
        showFlash,
    };
}
