"use client";

import { useCallback, useEffect, useState } from "react";

interface UseDragDropReturn {
    isDragging: boolean;
    handleDrop: (callback: (file: File) => void) => void;
}

export function useDragDrop(enabled: boolean = true): UseDragDropReturn {
    const [isDragging, setIsDragging] = useState(false);
    const [dropCallback, setDropCallback] = useState<
        ((file: File) => void) | null
    >(null);

    const handleDrop = useCallback((callback: (file: File) => void) => {
        setDropCallback(() => callback);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const onDragLeave = (e: DragEvent) => {
            if (e.clientX === 0 && e.clientY === 0) {
                setIsDragging(false);
            }
        };

        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer?.files.length && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("video/") && dropCallback) {
                    dropCallback(file);
                }
            }
        };

        window.addEventListener("dragover", onDragOver);
        window.addEventListener("dragleave", onDragLeave);
        window.addEventListener("drop", onDrop);

        return () => {
            window.removeEventListener("dragover", onDragOver);
            window.removeEventListener("dragleave", onDragLeave);
            window.removeEventListener("drop", onDrop);
        };
    }, [enabled, dropCallback]);

    return { isDragging, handleDrop };
}
