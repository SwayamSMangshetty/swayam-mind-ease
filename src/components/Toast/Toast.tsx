import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />;
      case 'error':
        return <AlertCircle size={20} className="text-danger" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      case 'info':
        return <Info size={20} className="text-info" />;
      default:
        return <Info size={20} className="text-info" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/30';
      case 'error':
        return 'bg-danger/10 border-danger/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'info':
        return 'bg-info/10 border-info/30';
      default:
        return 'bg-info/10 border-info/30';
    }
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg
        ${getStyles()} transition-all duration-300 animate-slide-in-right
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-app text-sm mb-1 transition-colors duration-200">
          {title}
        </h4>
        {message && (
          <p className="text-app-muted text-xs leading-relaxed transition-colors duration-200">
            {message}
          </p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95"
      >
        <X size={16} className="text-app-muted" />
      </button>
    </div>
  );
};

export default Toast;