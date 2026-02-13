"use client";

import { motion } from "framer-motion";

export function AboutSection() {
    return (
        <motion.section
            className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center gap-8 md:gap-10 relative z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
        >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.15]">
                Reframe is a web-based tool
                <br className="hidden md:block" /> built by and for creatives.
            </h2>
            <p className="text-base md:text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
                Helping professional AI filmmakers to seamlessly extend their videos by
                extracting any frame and building from there, transforming their creative
                process.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-between w-full pt-16 md:pt-24 border-t border-zinc-900 text-zinc-600 text-[10px] md:text-xs tracking-wider uppercase font-mono mt-8 md:mt-12 gap-4">
                <span>Serverless, client-based web app. 100% Secure.</span>
                <span>Copyright AD Terms of Service apply.</span>
            </div>
        </motion.section>
    );
}
