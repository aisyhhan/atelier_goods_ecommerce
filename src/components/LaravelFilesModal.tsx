import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Terminal } from 'lucide-react';
import { LARAVEL_PROJECT_FILES } from '../data/laravelProjectData.ts';
import { downloadLaravelProjectZip } from '../utils/laravelZipExporter.ts';

interface LaravelFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaravelFilesModal: React.FC<LaravelFilesModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(LARAVEL_PROJECT_FILES[0].path);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const currentFile = LARAVEL_PROJECT_FILES.find((f) => f.path === selectedFile) || LARAVEL_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadLaravelProjectZip();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-4xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>Source Code Framework Laravel 11</span>
              <span className="text-[11px] font-normal px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                Desain Sama Persis &middot; Blade + Tailwind
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              File PHP asli siap dijalankan dengan <code>php artisan serve</code> di VS Code
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Mengunduh...' : 'Unduh File Laravel (.zip)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-700 shrink-0" />
            <span>Cara running di VS Code: <code>php artisan migrate --seed</code> lalu <code>php artisan serve</code></span>
          </div>
          <span className="text-[11px] text-neutral-400">Total {LARAVEL_PROJECT_FILES.length} file</span>
        </div>

        {/* Content Body: Sidebar + Code */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          
          {/* File Selector */}
          <div className="md:col-span-4 border-r border-neutral-200 overflow-y-auto p-3 space-y-1 bg-neutral-50/40">
            {LARAVEL_PROJECT_FILES.map((file) => {
              const active = file.path === selectedFile;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-neutral-900 text-white font-medium shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-neutral-400'}`} />
                    <span className="font-mono truncate">{file.name}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200/60 text-neutral-600'}`}>
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 flex flex-col overflow-hidden bg-neutral-900 text-neutral-100">
            <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400">{currentFile.path}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 text-xs font-mono leading-relaxed">
              <pre className="text-neutral-200">{currentFile.content}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
          <span className="text-neutral-500">
            Ekstrak file ZIP ini ke folder proyek Laravel Anda, lalu jalankan di VS Code.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
