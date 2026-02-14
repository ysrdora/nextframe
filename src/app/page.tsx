"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { UploadButton } from "@/components/upload-button";
import { AboutSection } from "@/components/about-section";
import { VideoEditor } from "@/components/editor/video-editor";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { cn } from "@/lib/utils";

type AppMode = "landing" | "editor";

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragging, handleDrop } = useDragDrop(mode === "landing");

  const handleFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith("video/")) return;
    setVideoFile(file);
    setMode("editor");
    document.body.classList.add("editor-mode");
  }, []);

  const handleReset = useCallback(() => {
    setMode("landing");
    setVideoFile(null);
    document.body.classList.remove("editor-mode");
  }, []);

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup: remove editor-mode class when this component unmounts (e.g. route change)
  useEffect(() => {
    return () => {
      document.body.classList.remove("editor-mode");
    };
  }, []);

  // Register drag-and-drop callback
  useEffect(() => {
    handleDrop(handleFile);
  }, [handleDrop, handleFile]);

  return (
    <div
      className={cn(
        "min-h-[100dvh] w-full flex flex-col p-3 md:p-6 overflow-x-hidden",
        "transition-colors duration-500 selection:bg-white selection:text-black",
        isDragging && "drag-active"
      )}
    >
      <Navbar
        isEditorMode={mode === "editor"}
        onImport={triggerUpload}
        onReset={handleReset}
      />

      <AnimatePresence mode="wait">
        {mode === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col flex-1"
          >
            {/* Main Stage - Hero */}
            <div className="relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-zinc-800/50 group shadow-2xl h-[82vh] md:h-[85vh] shrink-0">
              <HeroSection />
            </div>

            {/* Upload CTA */}
            <div className="relative h-28 shrink-0 z-40">
              <UploadButton onUpload={triggerUpload} />
            </div>

            {/* About Section */}
            <AboutSection />
          </motion.div>
        ) : videoFile ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col flex-1 min-h-0"
          >
            <VideoEditor videoFile={videoFile} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleFile(files[0]);
          }
          // Reset so the same file can be selected again
          e.target.value = "";
        }}
      />
    </div>
  );
}
