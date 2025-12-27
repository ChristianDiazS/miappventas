import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Componente Loading Spinner mejorado
 * @param {Object} props
 * @param {string} props.size - Tamaño: 'sm', 'md', 'lg'
 * @param {string} props.message - Mensaje de carga
 * @param {boolean} props.fullPage - Si es pantalla completa
 * @param {string} props.color - Color del spinner
 */
export const LoadingSpinner = ({
  size = 'md',
  message = 'Cargando...',
  fullPage = false,
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Componente Skeleton para loading states
 */
export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
};

export default LoadingSpinner;
