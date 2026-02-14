"use client";

import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <div className="absolute inset-0 z-10">
            <div className="absolute inset-0 overflow-hidden group">
                <motion.img
                    src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2942&auto=format&fit=crop"
                    alt="Cinematic background"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[20%]"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                />
            </div>
            <div className="absolute inset-0 hero-gradient" />
            <motion.div
                className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-3 text-white">
                    Intelligent Frame
                    <br />
                    Extraction.
                </h1>
                <p className="text-zinc-500 text-sm font-normal tracking-wide">
                    Visual storytelling begins and ends with a frame.
                </p>
            </motion.div>
        </div>
    );
}
