import { useState, useRef, useEffect } from 'react';

export function LazyImage({ src, alt, className = '', onError, ...props }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Verificar que IntersectionObserver esté disponible
    if (typeof IntersectionObserver === 'undefined') {
      // Si no está disponible (tests), cargar imagen directamente
      setImageSrc(src);
      return;
    }

    // Opciones para el Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: '50px', // Cargar 50px antes de entrar al viewport
      threshold: 0.01
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Imagen entra en el viewport, cargarla
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      {/* Placeholder mientras se carga */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
      
      {/* Imagen real */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setIsLoaded(true);
          if (onError) onError(e);
        }}
        {...props}
      />
    </div>
  );
}
