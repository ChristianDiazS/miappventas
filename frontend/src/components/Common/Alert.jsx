import React from 'react';
import { AlertCircle, XCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Componente de alerta versátil para mostrar mensajes de error, éxito, advertencia e información
 * @param {Object} props
 * @param {string} props.type - Tipo de alerta: 'error', 'success', 'warning', 'info'
 * @param {string} props.title - Título de la alerta
 * @param {string} props.message - Mensaje principal
 * @param {React.ReactNode} props.details - Detalles adicionales
 * @param {Function} props.onClose - Callback cuando se cierra la alerta
 * @param {boolean} props.closeable - Si se puede cerrar (por defecto: true)
 * @param {number} props.autoClose - Tiempo en ms para auto-cerrar (0 = no cerrar)
 */
export const Alert = ({
  type = 'info',
  title,
  message,
  details,
  onClose,
  closeable = true,
  autoClose = 0
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const alertStyles = {
    error: {
      container: 'bg-red-50 border-l-4 border-red-500',
      icon: 'text-red-500',
      title: 'text-red-900',
      message: 'text-red-800'
    },
    success: {
      container: 'bg-green-50 border-l-4 border-green-500',
      icon: 'text-green-500',
      title: 'text-green-900',
      message: 'text-green-800'
    },
    warning: {
      container: 'bg-yellow-50 border-l-4 border-yellow-500',
      icon: 'text-yellow-500',
      title: 'text-yellow-900',
      message: 'text-yellow-800'
    },
    info: {
      container: 'bg-blue-50 border-l-4 border-blue-500',
      icon: 'text-blue-500',
      title: 'text-blue-900',
      message: 'text-blue-800'
    }
  };

  const styles = alertStyles[type];
  const IconComponent = {
    error: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info
  }[type];

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className={`p-4 rounded-lg ${styles.container} flex gap-4`}>
      <IconComponent className={`${styles.icon} flex-shrink-0 w-5 h-5 mt-0.5`} />
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${styles.title}`}>{title}</h3>}
        {message && <p className={`mt-1 ${styles.message}`}>{message}</p>}
        {details && <div className={`mt-2 text-sm ${styles.message}`}>{details}</div>}
      </div>
      {closeable && (
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ${styles.icon} hover:opacity-70`}
        >
          <span className="sr-only">Cerrar</span>
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
