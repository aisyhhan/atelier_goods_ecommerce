import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 text-xs max-w-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
