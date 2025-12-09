/**
 * Toast Component
 * Notificaciones no invasivas
 * 
 * Props:
 *  - type: 'success' | 'error' | 'warning' | 'info' = 'info'
 *  - message: string
 *  - duration: number (ms) = 5000
 *  - onClose: () => void
 *  - position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
 */

import { useEffect } from 'react';

export function Toast({
  type = 'info',
  message,
  duration = 5000,
  onClose,
  position = 'top-right',
}) {
  // Auto-close después de duration
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ'
  };

  return (
    <div className={`fixed ${positionStyles[position]} z-50 animate-slide-in`}>
      <div className={`${typeStyles[type]} rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-sm`}>
        <span className="text-xl font-bold">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Para usar sin React hook, export una versión simple
export function SimpleToast({ type = 'info', message, position = 'top-right' }) {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500'
  };

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionStyles[position]} z-50`}>
      <div className={`${typeStyles[type]} text-white rounded-lg shadow-lg p-4 max-w-sm`}>
        {message}
      </div>
    </div>
  );
}
