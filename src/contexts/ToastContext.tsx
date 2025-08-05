import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastType, ToastProps } from '../components/Toast/Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType, 
    title: string, 
    message?: string, 
    duration: number = 4000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      id,
      type,
      title,
      message,
      duration,
      onClose: removeToast
    };

    setToasts(prev => [...prev, toast]);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <div
              className={`
                relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg
                ${toast.type === 'success' ? 'bg-success/10 border-success/30' :
                  toast.type === 'error' ? 'bg-danger/10 border-danger/30' :
                  toast.type === 'warning' ? 'bg-warning/10 border-warning/30' :
                  'bg-info/10 border-info/30'} 
                transition-all duration-300 animate-slide-in-right
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' && <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                {toast.type === 'error' && <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                {toast.type === 'warning' && <div className="w-5 h-5 rounded-full bg-warning flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                {toast.type === 'info' && <div className="w-5 h-5 rounded-full bg-info flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-app text-sm mb-1 transition-colors duration-200">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-app-muted text-xs leading-relaxed transition-colors duration-200">
                    {toast.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 hover:bg-app-dark rounded-full transition-all duration-200 active:scale-95"
              >
                <div className="w-4 h-4 text-app-muted">×</div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};