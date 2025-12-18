import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-cyan-500 animate-spin"></div>
        <p className="text-gray-400 text-center mt-4">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
