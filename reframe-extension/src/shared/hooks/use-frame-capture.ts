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

    const extractFrameFromVideo = useCallback(
        (source: HTMLVideoElement, filename: string): CapturedFrame | null => {
            if (!source.videoWidth) return null;
            const canvas = getCanvas();
            canvas.width = source.videoWidth;
            canvas.height = source.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            ctx.drawImage(source, 0, 0);
            return {
                dataUrl: canvas.toDataURL("image/png"),
                filename,
                timestamp: source.currentTime,
            };
        },
        [getCanvas]
    );

    const batchCapture = useCallback(async (): Promise<CapturedFrame[]> => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || !video.src) return [];

        triggerFlash();

        // Use an offscreen video so the visible player doesn't jump
        const offscreen = document.createElement("video");
        offscreen.src = video.src;
        offscreen.muted = true;
        offscreen.preload = "auto";

        const waitForReady = (): Promise<void> =>
            new Promise((resolve) => {
                if (offscreen.readyState >= 2) {
                    resolve();
                    return;
                }
                offscreen.addEventListener("loadeddata", () => resolve(), { once: true });
            });

        const seekOffscreen = (time: number): Promise<void> =>
            new Promise((resolve) => {
                offscreen.addEventListener("seeked", () => resolve(), { once: true });
                offscreen.currentTime = time;
            });

        await waitForReady();

        const frames: CapturedFrame[] = [];

        try {
            // Capture first frame
            await seekOffscreen(0);
            const startFrame = extractFrameFromVideo(offscreen, "REFRAME_START.png");
            if (startFrame) frames.push(startFrame);

            // Capture last frame (duration - tiny epsilon to avoid overshoot)
            const endTime = Math.max(0, offscreen.duration - 0.01);
            await seekOffscreen(endTime);
            const endFrame = extractFrameFromVideo(offscreen, "REFRAME_END.png");
            if (endFrame) frames.push(endFrame);
        } catch (error) {
            console.error("Batch extraction error:", error);
        }

        // Clean up offscreen element
        offscreen.src = "";
        offscreen.load();

        return frames;
    }, [videoRef, triggerFlash, extractFrameFromVideo]);

    return {
        captureFrame,
        batchCapture,
        showFlash,
    };
}
