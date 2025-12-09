/**
 * Card Component
 * Componente base para cards reutilizables
 * 
 * Props:
 *  - children: ReactNode
 *  - className: string
 *  - shadow: 'sm' | 'md' | 'lg' = 'md'
 *  - padding: 'sm' | 'md' | 'lg' = 'md'
 *  - hover: boolean = false
 */

export function Card({
  children,
  className = '',
  shadow = 'md',
  padding = 'md',
  hover = false,
}) {
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';

  return (
    <div className={`bg-white rounded-lg ${shadows[shadow]} ${paddings[padding]} ${hoverClass} transition-colors ${className}`}>
      {children}
    </div>
  );
}
