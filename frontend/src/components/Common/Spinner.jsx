/**
 * Spinner Component
 * Indicador de carga
 * 
 * Props:
 *  - size: 'sm' | 'md' | 'lg' = 'md'
 *  - color: 'primary' | 'white' = 'primary'
 *  - fullScreen: boolean = false
 *  - message: string
 */

export function Spinner({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  message = '',
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colors = {
    primary: 'border-cyan-500',
    white: 'border-white'
  };

  const spinnerClass = `${sizes[size]} border-4 border-gray-200 ${colors[color]} rounded-full animate-spin`;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
        <div className={spinnerClass}></div>
        {message && (
          <p className="text-white mt-4 text-lg font-semibold">{message}</p>
        )}
      </div>
    );
  }

  return <div className={spinnerClass}></div>;
}
