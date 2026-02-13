"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryFrame {
    id: string;
    dataUrl: string;
    filename: string;
}

interface GalleryPanelProps {
    frames: GalleryFrame[];
    isExpanded: boolean;
}

function downloadFrame(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
}

export function GalleryPanel({ frames, isExpanded }: GalleryPanelProps) {
    return (
        <motion.div
            className="absolute inset-0 flex flex-col justify-end z-40"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
        >
            <div
                className={cn(
                    "h-full border-t bg-[#080808] flex items-center px-4 overflow-hidden transition-colors duration-500",
                    isExpanded ? "border-white/20" : "border-white/5"
                )}
            >
                {frames.length === 0 && (
                    <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-800 mr-6 select-none">
                        Gallery
                    </span>
                )}
                <div className="flex-1 h-full flex gap-3 items-center overflow-x-auto hide-scrollbar py-2 px-1">
                    <AnimatePresence mode="popLayout">
                        {frames.map((frame) => (
                            <motion.div
                                key={frame.id}
                                layout
                                initial={{ width: 0, opacity: 0, x: -20 }}
                                animate={{ width: "6rem", opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.5,
                                    ease: [0.2, 0.8, 0.2, 1],
                                }}
                                className="group relative h-full aspect-video bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:border-zinc-500 transition-all duration-300 hover:shadow-xl"
                            >
                                <img
                                    src={frame.dataUrl}
                                    alt={frame.filename}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/40 transition backdrop-blur-[2px]">
                                    <button
                                        onClick={() =>
                                            downloadFrame(frame.dataUrl, frame.filename)
                                        }
                                        className="text-white hover:scale-110 transition drop-shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* New indicator dot */}
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg opacity-100 group-hover:opacity-0 transition-opacity" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
