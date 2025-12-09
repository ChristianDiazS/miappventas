/**
 * Button Component
 * Componente reutilizable para botones con múltiples variantes
 * 
 * Props:
 *  - variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary'
 *  - size: 'sm' | 'md' | 'lg' = 'md'
 *  - disabled: boolean = false
 *  - loading: boolean = false
 *  - fullWidth: boolean = false
 *  - onClick: () => void
 *  - children: ReactNode
 */

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
  className = '',
  ...props
}) {
  const variantStyles = {
    primary: 'bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700',
    secondary: 'bg-violet-500 text-white hover:bg-violet-600 active:bg-violet-700',
    outline: 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 active:bg-cyan-100',
    ghost: 'text-cyan-500 hover:underline hover:text-cyan-600'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg font-semibold'
  };

  const baseStyles = 'font-medium transition-colors duration-200 inline-flex items-center justify-center gap-2';
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="inline-block animate-spin">⏳</span>}
      {children}
    </button>
  );
}
