import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

interface VideoPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    progress: number;
    timecode: string;
    isLoaded: boolean;
}

interface UseVideoPlayerReturn extends VideoPlayerState {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    togglePlay: () => void;
    seek: (percent: number) => void;
    seekTo: (time: number) => Promise<void>;
    stepFrame: (direction: -1 | 1) => void;
}

export function useVideoPlayer(externalRef?: React.RefObject<HTMLVideoElement | null>): UseVideoPlayerReturn {
    const internalRef = useRef<HTMLVideoElement | null>(null);
    const videoRef = externalRef || internalRef;
    const [state, setState] = useState<VideoPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        progress: 0,
        timecode: "00:00:00",
        isLoaded: false,
    });

    const updateTime = useCallback(() => {
        const video = videoRef.current;
        if (!video || isNaN(video.duration)) return;
        const progress = (video.currentTime / video.duration) * 100;
        setState((prev) => ({
            ...prev,
            currentTime: video.currentTime,
            duration: video.duration,
            progress,
            timecode: formatTime(video.currentTime),
        }));
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setState((prev) => ({ ...prev, isPlaying: true }));
        } else {
            video.pause();
            setState((prev) => ({ ...prev, isPlaying: false }));
        }
    }, []);

    const seek = useCallback((percent: number) => {
        const video = videoRef.current;
        if (!video || isNaN(video.duration)) return;
        const time = (percent / 100) * video.duration;
        video.currentTime = time;
        setState((prev) => ({
            ...prev,
            currentTime: time,
            progress: percent,
            timecode: formatTime(time),
        }));
    }, []);

    const seekTo = useCallback((time: number): Promise<void> => {
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
    }, []);

    const stepFrame = useCallback(
        (direction: -1 | 1) => {
            const video = videoRef.current;
            if (!video || isNaN(video.duration)) return;
            if (!video.paused) {
                video.pause();
            }
            const newTime = Math.max(
                0,
                Math.min(video.duration, video.currentTime + direction * (1 / 24))
            );
            video.currentTime = newTime;

            // Optimistic state update — don't wait for seeked event
            const progress = (newTime / video.duration) * 100;
            setState((prev) => ({
                ...prev,
                isPlaying: false,
                currentTime: newTime,
                progress,
                timecode: formatTime(newTime),
            }));
        },
        []
    );

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => updateTime();
        const handleLoadedMetadata = () => {
            setState((prev) => ({
                ...prev,
                duration: video.duration,
                isLoaded: true,
                currentTime: 0,
                progress: 0,
                timecode: "00:00:00",
            }));
        };
        const handleEnded = () => {
            setState((prev) => ({ ...prev, isPlaying: false }));
        };
        const handlePlay = () => {
            setState((prev) => ({ ...prev, isPlaying: true }));
        };
        const handlePause = () => {
            setState((prev) => ({ ...prev, isPlaying: false }));
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [updateTime]);

    return {
        videoRef,
        ...state,
        togglePlay,
        seek,
        seekTo,
        stepFrame,
    };
}
