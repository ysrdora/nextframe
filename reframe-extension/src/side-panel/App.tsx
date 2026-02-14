import { LocalUploadMode } from './LocalUploadMode';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50 shrink-0">
        <div className="p-4">
          <h1 className="text-xl font-semibold">Reframe</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <LocalUploadMode />
      </div>
    </div>
  );
}
