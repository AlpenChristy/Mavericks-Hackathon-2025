import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`flex items-center p-4 rounded-lg shadow-lg border ${
        type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 mr-3 text-red-600" />
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast; 