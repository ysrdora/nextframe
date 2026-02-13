"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface UploadButtonProps {
    onUpload: () => void;
}

export function UploadButton({ onUpload }: UploadButtonProps) {
    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-50">
            <motion.button
                onClick={onUpload}
                className="bg-white text-black px-6 py-3 md:px-10 md:py-4 rounded-full flex items-center gap-3 md:gap-4 hover:bg-zinc-200 cursor-pointer group shadow-[0_20px_60px_-10px_rgba(255,255,255,0.15)] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <Upload className="w-4 h-4 md:w-[22px] md:h-[22px] text-black/70 group-hover:text-black transition" />
                <span className="text-sm md:text-base font-semibold tracking-wide text-black">
                    Add a Video
                </span>
            </motion.button>
            <motion.p
                className="text-[10px] text-zinc-600 font-medium tracking-wide mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                or drop video to begin -  See FAQ.
            </motion.p>
        </div>
    );
}
