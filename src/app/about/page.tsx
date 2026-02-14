"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Layers, Shield, Zap } from "lucide-react";

const features = [
    {
        icon: Film,
        title: "Frame-Perfect Extraction",
        description:
            "Step through your footage frame-by-frame at 24fps precision. Capture exactly the moment you need — no guessing, no compromise.",
    },
    {
        icon: Layers,
        title: "Batch Processing",
        description:
            "Extract first and last frames instantly, or build full contact sheets. Export as high-quality PNGs or self-contained HTML documents.",
    },
    {
        icon: Zap,
        title: "Instant, Client-Side",
        description:
            "Everything runs in your browser. No uploads, no waiting, no servers. Your footage never leaves your machine.",
    },
    {
        icon: Shield,
        title: "100% Private & Secure",
        description:
            "Zero data collection, zero tracking. Your creative work stays yours — always. No accounts needed to get started.",
    },
];

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export default function AboutPage() {
    // Defensive: ensure editor-mode scroll lock is cleared when visiting this page
    useEffect(() => {
        document.body.classList.remove("editor-mode");
    }, []);

    return (
        <div className="min-h-[100dvh] w-full flex flex-col p-3 md:p-6 overflow-x-hidden selection:bg-white selection:text-black">
            {/* Nav */}
            <nav className="flex items-center justify-between mb-4 z-50 shrink-0 relative">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 group"
                >
                    <span className="font-semibold tracking-tight text-lg text-zinc-200 group-hover:text-white transition">
                        next frame
                    </span>
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition text-xs font-medium tracking-wide"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </Link>
            </nav>

            {/* Hero */}
            <motion.div
                className="relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-zinc-800/50 shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="px-6 md:px-16 py-20 md:py-32 text-center flex flex-col items-center">
                    <motion.p
                        className="text-[10px] md:text-xs font-mono text-zinc-600 tracking-[0.2em] uppercase mb-6"
                        {...fadeUp}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        About Next Frame
                    </motion.p>
                    <motion.h1
                        className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1] max-w-3xl"
                        {...fadeUp}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        A web-based tool
                        <br className="hidden md:block" />
                        {" "}built by and for creatives.
                    </motion.h1>
                    <motion.p
                        className="text-base md:text-lg text-zinc-500 max-w-xl leading-relaxed font-light mt-6"
                        {...fadeUp}
                        transition={{ delay: 0.35, duration: 0.6 }}
                    >
                        Transforming the filmmaking process by enabling professional AI filmmakers to effortlessly extend their stories — extract any frame, build upon it.
                    </motion.p>
                </div>
            </motion.div>

            {/* Features */}
            <div className="max-w-5xl mx-auto w-full py-20 md:py-28 px-4">
                <motion.p
                    className="text-[10px] md:text-xs font-mono text-zinc-600 tracking-[0.2em] uppercase text-center mb-12"
                    {...fadeUp}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    What we do differently
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="group rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-6 md:p-8 hover:border-zinc-700/60 transition-colors"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.55 + i * 0.1,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <feature.icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-200 tracking-tight">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Workflow */}
            <div className="max-w-5xl mx-auto w-full px-4 pb-20 md:pb-28">
                <motion.p
                    className="text-[10px] md:text-xs font-mono text-zinc-600 tracking-[0.2em] uppercase text-center mb-12"
                    {...fadeUp}
                    transition={{ delay: 0.9, duration: 0.5 }}
                >
                    How it works
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {[
                        {
                            step: "01",
                            title: "Drop your video",
                            desc: "Drag and drop any video file — MP4, MOV, WebM. No upload, no waiting.",
                        },
                        {
                            step: "02",
                            title: "Scrub & capture",
                            desc: "Use frame-precise controls to find the exact moment. Snap it in one click.",
                        },
                        {
                            step: "03",
                            title: "Export & create",
                            desc: "Download frames individually, in bulk, or as a styled contact sheet.",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={item.step}
                            className="text-center md:text-left"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 1 + i * 0.12,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <span className="text-xs font-mono text-zinc-700 tracking-widest">
                                {item.step}
                            </span>
                            <h4 className="text-base font-semibold text-zinc-200 mt-2 mb-2 tracking-tight">
                                {item.title}
                            </h4>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <motion.div
                className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-between pt-8 pb-6 border-t border-zinc-900 text-zinc-600 text-[10px] md:text-xs tracking-wider uppercase font-mono gap-4 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
            >
                <span>Serverless, client-based web app. 100% Secure.</span>
                <span>Copyright Film-maker Network — Terms of Service apply.</span>
            </motion.div>
        </div>
    );
}
