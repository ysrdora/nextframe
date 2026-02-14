import { useRef, useState, useCallback } from 'react';
import { Upload, Film } from 'lucide-react';
import { VideoEditor } from '../shared/components/editor/video-editor';

export function LocalUploadMode() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('video/')) {
      setVideoFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  if (videoFile) {
    return (
      <div className="flex-1 flex flex-col p-4">
        <VideoEditor videoFile={videoFile} />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      style={{ minHeight: 'calc(100vh - 140px)' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className={`
          flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-800 hover:border-zinc-700'
          }
        `}
      >
        <Film className={`w-16 h-16 mb-6 transition-colors ${isDragging ? 'text-blue-500' : 'text-zinc-700'}`} />

        <button
          onClick={() => inputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl flex items-center gap-3 cursor-pointer font-semibold text-base transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
        >
          <Upload className="w-5 h-5" />
          Upload Video
        </button>

        <p className="mt-4 text-sm text-zinc-500 max-w-[280px]">
          {isDragging ? 'Drop your video here' : 'Drag & drop a video or click to browse. All processing happens locally.'}
        </p>

        <p className="mt-2 text-xs text-zinc-700">
          Supports MP4, WebM, MOV, and more
        </p>
      </div>
    </div>
  );
}
