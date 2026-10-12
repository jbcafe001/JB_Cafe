import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-amber-50/95 border border-amber-200/80 shadow-lg shadow-amber-500/10';
        let textColor = 'text-amber-950';
        let Icon = Info;
        let iconColor = 'text-amber-600';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50/95 border border-emerald-200/80 shadow-lg shadow-emerald-500/10';
          textColor = 'text-emerald-900';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-50/95 border border-rose-200/80 shadow-lg shadow-rose-500/10';
          textColor = 'text-rose-900';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative flex items-center space-x-3 px-4 py-3 rounded-2xl backdrop-blur-md animate-slide-in-right card-interactive ${bgColor} ${textColor}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor} animate-float-subtle`} />
            <p className="text-sm font-black tracking-wide pr-6">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1.5 hover:bg-black/5 active:scale-90 rounded-xl transition-all absolute right-2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
