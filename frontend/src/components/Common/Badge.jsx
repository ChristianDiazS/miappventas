/**
 * Badge Component
 * Etiquetas/badges para estados
 * 
 * Props:
 *  - variant: 'success' | 'error' | 'warning' | 'info' | 'primary' = 'primary'
 *  - size: 'sm' | 'md' | 'lg' = 'md'
 *  - children: ReactNode
 */

export function Badge({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
}) {
  const variants = {
    success: 'bg-green-100 text-green-800 border border-green-300',
    error: 'bg-red-100 text-red-800 border border-red-300',
    warning: 'bg-amber-100 text-amber-800 border border-amber-300',
    info: 'bg-blue-100 text-blue-800 border border-blue-300',
    primary: 'bg-cyan-100 text-cyan-800 border border-cyan-300'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-full',
    md: 'px-3 py-1 text-sm rounded-full',
    lg: 'px-4 py-2 text-base rounded-full'
  };

  return (
    <span className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
