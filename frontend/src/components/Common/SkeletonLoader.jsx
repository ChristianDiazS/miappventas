import React from 'react';

/**
 * SkeletonLoader Component
 * Componente reutilizable para mostrar placeholders de carga
 * Similar a: Netflix, Amazon, Shopify
 */
export function SkeletonLoader({ 
  variant = 'card',
  count = 1,
  className = '' 
}) {
  const baseClasses = 'bg-gray-200 animate-pulse rounded';
  
  // Variante: Card de producto
  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow-md">
            {/* Image skeleton */}
            <div className={`${baseClasses} h-48 w-full mb-4`} />
            
            {/* Title skeleton */}
            <div className="px-4 space-y-3">
              <div className={`${baseClasses} h-4 w-3/4`} />
              <div className={`${baseClasses} h-4 w-1/2`} />
              
              {/* Price skeleton */}
              <div className={`${baseClasses} h-6 w-1/3 bg-cyan-100 my-2`} />
              
              {/* Button skeleton */}
              <div className={`${baseClasses} h-10 w-full mt-4`} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Variante: Text (párrafo)
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} h-4 w-full`} />
        ))}
      </div>
    );
  }
  
  // Variante: Heading
  if (variant === 'heading') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className={`${baseClasses} h-8 w-2/3`} />
        <div className={`${baseClasses} h-4 w-1/2`} />
      </div>
    );
  }
  
  // Variante: Image
  if (variant === 'image') {
    return (
      <div className={`${baseClasses} aspect-square w-full ${className}`} />
    );
  }
  
  // Variante: Profile
  if (variant === 'profile') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Avatar */}
        <div className={`${baseClasses} w-16 h-16 rounded-full mx-auto`} />
        {/* Name */}
        <div className={`${baseClasses} h-4 w-1/2 mx-auto`} />
        {/* Email */}
        <div className={`${baseClasses} h-4 w-2/3 mx-auto`} />
      </div>
    );
  }
  
  // Variante: List
  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className={`${baseClasses} w-12 h-12 shrink-0`} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClasses} h-4 w-3/4`} />
              <div className={`${baseClasses} h-3 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Default: Generic skeleton
  return (
    <div className={`${baseClasses} h-20 w-full ${className}`} />
  );
}

/**
 * Uso:
 * 
 * // Cargar productos
 * <SkeletonLoader variant="card" count={4} />
 * 
 * // Cargar texto
 * <SkeletonLoader variant="text" count={3} />
 * 
 * // Cargar perfil
 * <SkeletonLoader variant="profile" />
 * 
 * // Cargar lista
 * <SkeletonLoader variant="list" count={5} />
 */
