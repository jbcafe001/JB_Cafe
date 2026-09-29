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
        let bgColor = 'bg-stone-900';
        let textColor = 'text-white';
        let Icon = Info;
        let iconColor = 'text-stone-400';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50';
          textColor = 'text-emerald-900';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-500';
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-50';
          textColor = 'text-red-900';
          Icon = AlertCircle;
          iconColor = 'text-red-500';
        } else {
          bgColor = 'bg-stone-800';
          textColor = 'text-white';
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border border-black/5 animate-in slide-in-from-right-8 fade-in duration-300 ${bgColor} ${textColor}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <p className="text-sm font-bold tracking-wide pr-4">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors absolute right-2"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
