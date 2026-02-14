import { formatTime } from "@/lib/utils";

interface ExportFrame {
    dataUrl: string;
    filename: string;
    timestamp: number;
}

function generateContactSheetHtml(
    frames: ExportFrame[],
    videoName: string
): string {
    const safeName = videoName.replace(/\.[^.]+$/, "");
    const exportDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // Sort frames by timestamp
    const sorted = [...frames].sort((a, b) => a.timestamp - b.timestamp);

    const frameCards = sorted
        .map(
            (frame, i) => `
        <div class="frame-card">
            <div class="frame-image-wrap">
                <img src="${frame.dataUrl}" alt="Frame ${i + 1}" />
                <button class="download-btn" onclick="downloadFrame('${frame.dataUrl}', 'frame_${String(i + 1).padStart(3, "0")}.png')" title="Download frame">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </button>
            </div>
            <div class="frame-info">
                <span class="frame-number">#${String(i + 1).padStart(3, "0")}</span>
                <span class="frame-timestamp">${formatTime(frame.timestamp)}</span>
            </div>
        </div>`
        )
        .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName} — Contact Sheet</title>
    <style>
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0a0a0a;
            color: #e4e4e7;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            padding: 2rem;
            min-height: 100vh;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            margin-bottom: 0.5rem;
            color: #fafafa;
        }

        .header .meta {
            font-size: 0.75rem;
            color: #71717a;
            font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .header .meta span {
            margin: 0 0.75rem;
        }

        .header-actions {
            margin-top: 1.25rem;
        }

        .download-all-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.25rem;
            background: rgba(255,255,255,0.06);
            color: #e4e4e7;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            font-size: 0.75rem;
            font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: all 0.2s;
        }

        .download-all-btn:hover {
            background: rgba(255,255,255,0.12);
            border-color: rgba(255,255,255,0.2);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.25rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .frame-card {
            background: #141414;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.06);
            transition: border-color 0.2s;
        }

        .frame-card:hover {
            border-color: rgba(255,255,255,0.15);
        }

        .frame-image-wrap {
            position: relative;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            background: #0a0a0a;
        }

        .frame-image-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .download-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.6);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            color: rgba(255,255,255,0.7);
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s;
        }

        .frame-card:hover .download-btn {
            opacity: 1;
        }

        .download-btn:hover {
            background: rgba(255,255,255,0.2);
            color: #fff;
            transform: scale(1.1);
        }

        .frame-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.625rem 0.875rem;
        }

        .frame-number {
            font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
            font-size: 0.7rem;
            color: #a1a1aa;
            letter-spacing: 0.06em;
        }

        .frame-timestamp {
            font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
            font-size: 0.7rem;
            color: #3b82f6;
            letter-spacing: 0.04em;
            background: rgba(59,130,246,0.1);
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
        }

        .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.06);
            font-size: 0.65rem;
            color: #52525b;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
        }

        @media print {
            .download-btn, .download-all-btn, .header-actions { display: none; }

            body {
                background: #fff;
                color: #18181b;
                padding: 1rem;
            }

            .header { border-bottom-color: #e4e4e7; }
            .header h1 { color: #09090b; }
            .grid { grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }

            .frame-card {
                background: #fafafa;
                border-color: #e4e4e7;
                break-inside: avoid;
                page-break-inside: avoid;
            }

            .frame-number { color: #52525b; }
            .frame-timestamp { color: #2563eb; background: rgba(37,99,235,0.08); }
            .footer { border-top-color: #e4e4e7; color: #a1a1aa; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${safeName}</h1>
        <div class="meta">
            <span>${sorted.length} frame${sorted.length !== 1 ? "s" : ""}</span>
            <span>•</span>
            <span>${exportDate}</span>
        </div>
        <div class="header-actions">
            <button class="download-all-btn" onclick="downloadAll()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download All Frames
            </button>
        </div>
    </div>

    <div class="grid">
        ${frameCards}
    </div>

    <div class="footer">
        Generated by Next Frame Studio
    </div>

    <script>
        function downloadFrame(dataUrl, filename) {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function downloadAll() {
            const images = document.querySelectorAll('.frame-image-wrap img');
            images.forEach((img, i) => {
                setTimeout(() => {
                    const filename = 'frame_' + String(i + 1).padStart(3, '0') + '.png';
                    downloadFrame(img.src, filename);
                }, i * 150);
            });
        }
    </script>
</body>
</html>`;
}

export function exportAsHtml(
    frames: ExportFrame[],
    videoName: string
): void {
    const html = generateContactSheetHtml(frames, videoName);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const safeName = videoName
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_contact_sheet.html`;
    a.click();

    URL.revokeObjectURL(url);
}
