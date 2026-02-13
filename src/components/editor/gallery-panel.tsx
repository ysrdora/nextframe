"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Trash2,
    Maximize2,
    Minimize2,
    CheckSquare,
    FileSpreadsheet,
    X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

export interface GalleryFrame {
    id: string;
    dataUrl: string;
    filename: string;
    timestamp: number; // seconds into the video
}

interface GalleryPanelProps {
    frames: GalleryFrame[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onDeleteFrames: (ids: string[]) => void;
    videoName: string;
}

function downloadFrame(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
}

function dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/png";
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
}

async function exportAsZip(
    frames: GalleryFrame[],
    videoName: string
) {
    const JSZip = (await import("jszip")).default;
    const { saveAs } = await import("file-saver");

    const zip = new JSZip();
    const folder = zip.folder("frames");
    if (!folder) return;

    // Add each frame as PNG
    frames.forEach((frame, i) => {
        const blob = dataUrlToBlob(frame.dataUrl);
        const ext = frame.filename.split(".").pop() || "png";
        folder.file(`frame_${String(i + 1).padStart(3, "0")}.${ext}`, blob);
    });

    // Build CSV manifest
    const csvRows = [
        ["#", "Filename", "Timestamp", "Video"].join(","),
        ...frames.map((frame, i) =>
            [
                i + 1,
                `frame_${String(i + 1).padStart(3, "0")}.png`,
                formatTime(frame.timestamp),
                `"${videoName}"`,
            ].join(",")
        ),
    ];
    folder.file("manifest.csv", csvRows.join("\n"));

    const blob = await zip.generateAsync({ type: "blob" });
    const safeName = videoName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    saveAs(blob, `${safeName}_frames.zip`);
}

export function GalleryPanel({
    frames,
    isExpanded,
    onToggleExpand,
    onDeleteFrames,
    videoName,
}: GalleryPanelProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const isSelecting = selectedIds.size > 0;

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(frames.map((f) => f.id)));
    }, [frames]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleDeleteSelected = useCallback(() => {
        onDeleteFrames(Array.from(selectedIds));
        setSelectedIds(new Set());
    }, [selectedIds, onDeleteFrames]);

    const handleDownloadSelected = useCallback(() => {
        const selected = frames.filter((f) => selectedIds.has(f.id));
        selected.forEach((frame) => downloadFrame(frame.dataUrl, frame.filename));
    }, [frames, selectedIds]);

    const handleExport = useCallback(async () => {
        const toExport = isSelecting
            ? frames.filter((f) => selectedIds.has(f.id))
            : frames;
        await exportAsZip(toExport, videoName);
    }, [frames, selectedIds, isSelecting, videoName]);

    return (
        <motion.div
            className="absolute inset-0 flex flex-col justify-end z-40"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 24,
                mass: 0.8,
            }}
        >
            <div
                className={cn(
                    "h-full border-t bg-[#080808] flex flex-col transition-colors duration-500",
                    isExpanded ? "border-white/20" : "border-white/5"
                )}
            >
                {/* Gallery Toolbar */}
                <div className="flex items-center justify-between px-4 pt-2 pb-1 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-600 select-none">
                            Gallery
                        </span>
                        {frames.length > 0 && (
                            <span className="text-[9px] font-mono text-zinc-700 tabular-nums select-none">
                                {frames.length} frame{frames.length !== 1 ? "s" : ""}
                            </span>
                        )}

                        {/* Selection actions */}
                        <AnimatePresence>
                            {isSelecting && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-1.5 ml-2"
                                >
                                    <span className="text-[9px] font-mono text-blue-400 tabular-nums select-none">
                                        {selectedIds.size} selected
                                    </span>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleDownloadSelected}
                                                className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-white transition"
                                            >
                                                <Download className="w-3 h-3" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Download selected</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleDeleteSelected}
                                                className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Delete selected</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={clearSelection}
                                                className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-white transition"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Clear selection</TooltipContent>
                                    </Tooltip>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-1">
                        {frames.length > 0 && (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={selectAll}
                                            className="p-1.5 rounded hover:bg-white/10 text-zinc-600 hover:text-white transition"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Select all</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleExport}
                                            className="p-1.5 rounded hover:bg-white/10 text-zinc-600 hover:text-white transition"
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Export ZIP (images + CSV)</TooltipContent>
                                </Tooltip>
                            </>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={onToggleExpand}
                                    className="p-1.5 rounded hover:bg-white/10 text-zinc-600 hover:text-white transition"
                                >
                                    {isExpanded ? (
                                        <Minimize2 className="w-3.5 h-3.5" />
                                    ) : (
                                        <Maximize2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {isExpanded ? "Collapse gallery" : "Expand gallery"}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Frames */}
                <div className="flex-1 h-full flex gap-2.5 items-center overflow-x-auto hide-scrollbar py-1 px-4">
                    <AnimatePresence mode="popLayout">
                        {frames.map((frame) => {
                            const isSelected = selectedIds.has(frame.id);
                            return (
                                <motion.div
                                    key={frame.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        filter: "blur(0px)",
                                    }}
                                    exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                                    transition={{
                                        layout: {
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 28,
                                        },
                                        opacity: { duration: 0.25, ease: "easeOut" },
                                        scale: {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 22,
                                            mass: 0.6,
                                        },
                                        filter: { duration: 0.3 },
                                    }}
                                    className={cn(
                                        "group relative aspect-video rounded-xl overflow-hidden shrink-0 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                                        isExpanded ? "h-[calc(100%-8px)] w-auto" : "h-[calc(100%-8px)] w-auto",
                                        isSelected
                                            ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-[#080808] shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                            : "ring-1 ring-white/[0.06] hover:ring-white/20 shadow-lg hover:shadow-2xl"
                                    )}
                                    onClick={() => toggleSelect(frame.id)}
                                >
                                    {/* Image */}
                                    <img
                                        src={frame.dataUrl}
                                        alt={frame.filename}
                                        className={cn(
                                            "w-full h-full object-cover transition-all duration-500",
                                            isSelected ? "brightness-100" : "brightness-[0.85] group-hover:brightness-100 group-hover:scale-[1.03]"
                                        )}
                                    />

                                    {/* Subtle vignette overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                                    {/* Timestamp chip */}
                                    <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm font-mono text-[7px] text-zinc-200 tabular-nums tracking-wider ring-1 ring-white/[0.08]">
                                            {formatTime(frame.timestamp)}
                                        </span>
                                    </div>

                                    {/* Hover overlay with actions */}
                                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-[3px] transition-opacity duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadFrame(frame.dataUrl, frame.filename);
                                            }}
                                            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFrames([frame.id]);
                                            }}
                                            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-red-500/40 text-white hover:text-red-200 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Selection indicator */}
                                    <div
                                        className={cn(
                                            "absolute top-1.5 left-1.5 transition-all duration-200",
                                            isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-50 group-hover:scale-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded-[5px] flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                : "bg-white/20 backdrop-blur-sm ring-1 ring-white/30"
                                        )}>
                                            {isSelected && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
