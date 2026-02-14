"use client";

import { motion } from "framer-motion";

interface MobileTimecodeProps {
    timecode: string;
}

export function MobileTimecode({ timecode }: MobileTimecodeProps) {
    return (
        <motion.div
            className="absolute top-6 left-1/2 -translate-x-1/2 z-40 time-badge px-3 py-1 rounded-full md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <span className="font-mono text-[11px] text-zinc-200 font-medium tracking-widest tabular-nums">
                {timecode}
            </span>
        </motion.div>
    );
}
