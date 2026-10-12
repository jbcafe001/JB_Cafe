import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/35 backdrop-blur-md animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl shadow-stone-900/10 border border-stone-200/80 w-full max-w-sm overflow-hidden animate-modal-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl flex-shrink-0 animate-float-subtle ${isDestructive ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 mb-1">{title}</h3>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-stone-50/80 flex items-center justify-end space-x-3 border-t border-stone-100">
          <button
            onClick={onCancel}
            className="btn-interactive px-4 py-2.5 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-200/80 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`btn-interactive px-5 py-2.5 rounded-xl text-sm font-black text-white shadow-md ${
              isDestructive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
