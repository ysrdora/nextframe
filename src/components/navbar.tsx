"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    MoreVertical,
    Plus,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavbarProps {
    isEditorMode: boolean;
    onImport: () => void;
    onReset: () => void;
}

export function Navbar({ isEditorMode, onImport, onReset }: NavbarProps) {
    return (
        <nav className="flex items-center justify-between mb-4 z-50 shrink-0 relative">
            <div
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={onReset}
            >
                <span className="font-semibold tracking-tight text-lg text-zinc-200 group-hover:text-white transition">
                    reframe
                </span>
                <AnimatePresence>
                    {isEditorMode && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="px-1.5 py-px rounded-[4px] text-[9px] bg-zinc-800 text-zinc-500 font-mono tracking-wider"
                        >
                            STUDIO
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 relative">
                <button
                    onClick={isEditorMode ? onReset : onImport}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full",
                        "bg-white text-black",
                        "hover:bg-zinc-200",
                        "transition text-xs font-semibold group"
                    )}
                >
                    {isEditorMode ? (
                        <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>New</span>
                        </>
                    ) : (
                        "Get Started"
                    )}
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 transition hover:text-white outline-none">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 bg-[#1a1a1a] border-zinc-800"
                    >
                        <DropdownMenuItem className="text-[13px] text-zinc-400 hover:text-zinc-200 cursor-pointer">
                            About
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] text-zinc-400 hover:text-zinc-200 cursor-pointer">
                            Feedback
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="text-[13px] text-zinc-400 hover:text-zinc-200 cursor-pointer">
                            Privacy
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
